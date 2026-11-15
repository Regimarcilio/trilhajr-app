# ADR-001 — OAuth2 em vez de senha de aplicativo

- **Status:** Aceito (sujeito a aprovação final do usuário)
- **Data:** 2026-11-15
- **Decisores:** usuário (produto), MASTER, PLANMASTER, KALIMASTER
- **Issues:** [#12](https://github.com/Regimarcilio/trilhajr-app/issues/12), [#13](https://github.com/Regimarcilio/trilhajr-app/issues/13)
- **Relacionados:** [ADR-002](ADR-002-gmail-api-vs-imap-smtp-xoauth2.md), [ADR-003](ADR-003-multitenancy-token-storage.md)

## Contexto

O MailChat precisa acessar contas Gmail de vários usuários para ler, sincronizar e responder
e-mails. Historicamente, clientes de e-mail autenticavam com usuário + senha (IMAP/SMTP) ou com
"senha de app" gerada na conta Google. Ambas as opções exigem que o servidor **guarde um segredo
capaz de autenticar como o usuário**, o que amplia o impacto de um vazamento.

Ao mesmo tempo:
- o Google descontinuou o acesso de apps "menos seguros" e restringe escopos do Gmail;
- escopos restritos (`gmail.readonly`, `gmail.send`) só são aprovados para produção via OAuth2 com
  verificação;
- o produto é multiusuário, hospedado em servidor próprio, e portanto um vazamento de credencial
  afeta várias caixas de e-mail de uma vez.

## Decisão

Adotar **OAuth2 2.0 Authorization Code com PKCE (S256)** como único mecanismo de autenticação
com o Google.

Consequências diretas:
- Escopos mínimos: `openid email profile`, `gmail.readonly`, `gmail.send`.
- `access_type=offline` + `prompt=consent` para obter `refresh_token` de forma confiável.
- `state` de uso único (32 bytes, TTL 10 min) e `code_verifier`/`code_challenge` vinculados ao
  navegador por cookie assinado `HttpOnly`.
- `refresh_token` armazenado **criptografado** (AES-256-GCM, chave fora do código) — ver ADR-003.
- Revogação explícita em `https://oauth2.googleapis.com/revoke` ao desconectar.
- Nenhuma senha de usuário é solicitada, transmitida ou armazenada em qualquer momento.

## Alternativas consideradas

### A. Senha de app + IMAP/SMTP (rejeitada)

| Aspecto | Avaliação |
|---|---|
| Segurança | O servidor guarda uma credencial reutilizável de longa duração; vazamento = acesso total à caixa |
| Revogação | Manual pelo usuário no Google; o app não sabe que foi revogado até falhar |
| Escopos | Não existem: ou tem acesso total, ou não tem |
| 2FA | Exige senha de app; não é granular |
| Verificação Google | Fora do fluxo OAuth2; tende a ser bloqueada para novos apps |
| Multiusuário | Cada senha é um ativo crítico; superfície de ataque cresce linearmente |
| Experiência | Usuário precisa gerar e colar a senha; alto atrito |

**Motivo da rejeição:** viola o princípio de menor privilégio e concentra risco inaceitável em
um produto multiusuário.

### B. OAuth2 com escopos amplos (`https://mail.google.com/`) — rejeitada

Funciona, mas concede controle total (inclui exclusão permanente). Aumenta o escopo de verificação
e o impacto de um token comprometido. Não há requisito de produto que justifique.

### C. OAuth2 com `gmail.modify` — adiada

Útil para marcar como lido/arquivar. Não é necessária para "ler + responder". Fica registrada como
evolução possível, com justificativa de produto e novo ciclo de verificação.

### D. OAuth2 + PKCE sem `state` — rejeitada

PKCE protege a troca do code, mas não o callback contra CSRF/login forgery. `state` permanece
obrigatório (ver requisitos `SR-01` em `docs/security/requisitos-hardening.md`).

## Consequências

### Positivas
- Nenhuma senha de usuário armazenada; menor impacto em caso de vazamento do banco.
- Escopos granulares e auditáveis; usuário vê exatamente o que autoriza.
- Revogação centralizada e detecção de `invalid_grant` (conta marcada como `revoked`).
- Compatível com 2FA e com as políticas atuais do Google.
- Requisito para verificação/CASA, habilitando uso público.

### Negativas
- Complexidade adicional: refresh token, rotação, criptografia, tratamento de `invalid_grant`.
- Dependência do modo Testing (refresh token expira em 7 dias) até a verificação.
- Necessidade de `redirect_uri` estável com HTTPS e domínio verificado.
- Custo/tempo de verificação e CASA para uso público.
- Fluxo de reconexão precisa de UX dedicada.

### Riscos residuais
- Comprometimento do `client_secret` e das chaves de criptografia — mitigado por secret manager,
  rotação e principio de menor privilégio no servidor.
- Phishing de consentimento (usuário autoriza app falso) — fora do controle técnico; mitigado por
  nome/logo verificados do app.

## Critérios de reversão

Reverter para senha de app apenas se **todas** as condições abaixo ocorrerem:
1. O Google descontinuar OAuth2 para Gmail (não há sinal disso).
2. O produto deixar de ser multiusuário e passar a ser single-user local.
3. Houver requisito contratual explícito exigindo IMAP/SMTP legado.

Nesse cenário, a migração deve passar por novo ADR e novo threat model, mantendo o cofre de
segredos e a política de auditoria.

## Referências

- Google Identity — OAuth 2.0 for Web Server Applications.
- Gmail API — Authentication and authorization.
- `docs/security/threat-model-stride.md` (ameaças T-01..T-06).
- `docs/security/requisitos-hardening.md` (SR-01..SR-08).
