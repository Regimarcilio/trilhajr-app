# ADR-003 — Multi-tenancy por coluna e cofre de tokens criptografado

- **Status:** Aceito (sujeito a aprovação final do usuário)
- **Data:** 2026-11-15
- **Decisores:** usuário (produto), MASTER, KALIMASTER, PLANMASTER
- **Issues:** [#12](https://github.com/Regimarcilio/trilhajr-app/issues/12), [#13](https://github.com/Regimarcilio/trilhajr-app/issues/13)
- **Relacionados:** [ADR-001](ADR-001-oauth2-vs-senha-de-app.md), [ADR-002](ADR-002-gmail-api-vs-imap-smtp-xoauth2.md), [`docs/security/requisitos-hardening.md`](../../security/requisitos-hardening.md)

## Contexto

A instância é única (servidor próprio), mas os dados pertencem a **vários usuários** e incluem
conteúdo de e-mail — dado pessoal sensível na prática. Dois problemas precisam de decisão
conjunta:

1. **Modelo de isolamento**: como garantir que uma query nunca cruze dados de usuários?
2. **Proteção de credenciais**: onde e como armazenar `refresh_token`/`access_token`, e como
   rotacionar/revogar.

## Decisão

### Parte A — Isolamento: coluna `user_id` + autorização estrutural (RLS opcional)

- Uma única base e um único schema; cada tabela de domínio tem `user_id NOT NULL` com FK e índice.
- `userId` é **sempre** derivado da sessão e injetado por middleware, nunca de body/query/path.
- Repositórios recebem `userId` como parâmetro obrigatório; a query inclui `WHERE user_id = $1`.
- Recurso inexistente **ou** de outro usuário → `404` (não `403`), para não confirmar existência.
- IDs públicos são UUIDv7; IDs do Gmail (`gmail_thread_id`) não são expostos em rotas.
- Defesa em profundidade: **RLS (Row Level Security)** no Postgres, habilitada na fase de
  hardening, com `current_setting('app.user_id')` definido por conexão/transação.

### Parte B — Tokens: envelope encryption e chave versionada

- `refresh_token` criptografado com **AES-256-GCM**.
- Chave mestra **fora do código**: secret manager / variável de ambiente injetada em runtime
  (`TOKEN_ENCRYPTION_KEY`, base64 de 32 bytes), nunca no repositório.
- Envelope: a chave mestra (KEK) cifra uma chave de dados (DEK) por `key_version`; a DEK cifra o
  token. Permite rotação sem reescrever tudo de uma vez.
- AAD (Additional Authenticated Data) = `account_id`, impedindo troca de ciphertext entre contas.
- Campos persistidos: `refresh_ciphertext`, `refresh_iv`, `refresh_tag`, `key_version`, `updated_at`.
- `access_token`: **não** persistido por padrão; cache em Redis/memória com TTL igual ao
  `expires_in` menos 60 s de margem. Se persistido (fallback sem Redis), usar o mesmo esquema.
- Chave de sessão (`SESSION_SECRET`) separada da chave de tokens.
- **Rotação**: job semestral (ou sob suspeita) cria `key_version+1`, reencripta tokens em lote e
  mantém a versão antiga apenas para leitura durante a janela de migração.
- **Revogação**: ao desconectar, chamar `https://oauth2.googleapis.com/revoke?token=<refresh>`,
  marcar `connected_accounts.status = disconnected` e apagar `oauth_tokens` (hard delete).
- **Revogação externa**: `invalid_grant` → `status = revoked`, sem retry infinito, notificação ao
  usuário e auditoria.

## Alternativas consideradas

### A. Schema por tenant (rejeitada)

Isolamento forte no banco, mas: migrations multiplicadas por tenant, conexões e pools por schema,
complexidade operacional desproporcional ao porte (dezenas/centenas de usuários). Reservado para
cenário enterprise.

### B. Banco por tenant (rejeitada)

Custo e operação altos; backup/restore fragmentado; sem ganho relevante para o escopo atual.

### C. Guards apenas no handler (rejeitada)

Checar `userId` só no controller é frágil: um novo endpoint pode esquecer a checagem. A decisão
move a garantia para a camada de repositório (estrutural) + RLS (defesa em profundidade).

### D. Token em texto puro com "acesso restrito ao banco" (rejeitada)

Um dump de backup ou acesso de leitura ao banco exporia todas as caixas. Inaceitável para dados
de e-mail.

### E. Criptografia no cliente (rejeitada)

O backend precisa do token para chamar o Gmail; criptografia ponta a ponta no cliente não resolve
o risco do servidor e quebra o modelo multiusuário.

## Consequências

### Positivas
- Isolamento verificável por teste (cross-tenant sempre 404) e por revisão (repositório exige
  `userId`).
- Vazamento de banco não entrega tokens utilizáveis sem a chave.
- Rotação e revogação têm caminho definido e auditável.
- Compatível com LGPD: credenciais são eliminadas na exclusão, sem deixar segredo residual.

### Negativas
- Exige disciplina de código (nenhum acesso direto ao banco fora dos repositórios).
- RLS adiciona complexidade a migrations e testes (variável de sessão por conexão).
- Rotação de chave exige job e janela de compatibilidade.
- Perda da chave mestra = perda dos tokens (usuários precisam reconectar). Mitigação: backup
  seguro da chave, com acesso restrito e auditoria.

### Riscos residuais
- Comprometimento simultâneo de banco + chave: cenário de alto impacto; mitigado por segregação
  de acessos, alertas e princípio de menor privilégio.
- Erro de implementação em RLS pode bloquear tráfego legítimo; mitigado por testes de integração
  com dois usuários.

## Regras não negociáveis (para o BACKDEV)

1. Nenhum endpoint aceita `userId` do cliente.
2. Nenhum repositório tem método de leitura sem `userId`.
3. Nenhum token é logado, serializado em resposta ou enviado ao frontend.
4. Nenhuma query usa `gmail_thread_id`/`gmail_message_id` como chave pública de rota.
5. Nenhuma chave criptográfica em arquivo versionado; `.env.example` só com placeholders.

## Critérios de revisão

Reavaliar schema por tenant se: contrato exigir isolamento físico, ou o número de usuários/
requisitos regulatórios tornarem o modelo por coluna insuficiente. Nesse caso, novo ADR e plano
de migração com dupla escrita.
