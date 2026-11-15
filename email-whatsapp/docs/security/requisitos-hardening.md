# Requisitos de hardening — MailChat + Gmail OAuth2

- **Versão:** 1.0
- **Data:** 2026-11-15
- **Autor:** KALIMASTER (squad)
- **Issues:** [#13](https://github.com/Regimarcilio/trilhajr-app/issues/13) · [#12](https://github.com/Regimarcilio/trilhajr-app/issues/12)
- **Referências:** [Threat model](threat-model-stride.md) (ameaças `T-xx`) · [Plano de testes](plano-testes-seguranca.md) (`ST-xx`) · [Checklist de deploy](checklist-deploy.md)
- **Fases:** F1 (conexão) · F2 (leitura/sync) · F3 (envio) · F4 (hardening/go-live)

> Nível **MUST** = bloqueante para go-live. **SHOULD** = obrigatório salvo justificativa
> registrada em PR. **MAY** = desejável. Cada requisito tem verificação objetiva.

## 1. OAuth2

| ID | Requisito | Nível | Verificação | Fase |
|---|---|---|---|---|
| SR-01 | `state` gerado com ≥ 32 bytes de aleatoriedade criptográfica, uso único, TTL ≤ 10 min, vinculado ao navegador por cookie assinado `HttpOnly`; rejeitar ausente/divergente/expirado/reutilizado | MUST | Teste `ST-01`, `ST-02`, `ST-03` | F1 |
| SR-02 | PKCE obrigatório com `code_challenge_method=S256`; `code_verifier` nunca em URL nem em log; rejeitar callback sem verifier válido | MUST | `ST-04` | F1 |
| SR-03 | `redirect_uri` validada por **allowlist exata** (sem curinga, sem comparação por prefixo); em produção apenas HTTPS | MUST | `ST-05` + revisão de config | F1 |
| SR-04 | `id_token` validado: assinatura via JWKS do Google, `iss = accounts.google.com`, `aud = client_id`, `exp`/`iat`, `nonce`; exigir `email_verified = true` | MUST | `ST-06`, testes unitários | F1 |
| SR-05 | Escopos mínimos (`openid email profile gmail.readonly gmail.send`); nenhum escopo adicional sem ADR; `code` reutilizado é rejeitado | MUST | Revisão de config + `ST-07` | F1 |
| SR-06 | Usar `access_type=offline`, `include_granted_scopes=true`; quando faltar `refresh_token`, responder `409 RECONSENT_REQUIRED` e refazer com `prompt=consent` | MUST | Teste de integração com mock | F1 |

## 2. Tokens e criptografia

| ID | Requisito | Nível | Verificação | Fase |
|---|---|---|---|---|
| SR-07 | `refresh_token` cifrado com AES-256-GCM, IV único por operação, `tag` persistida, AAD = `account_id` | MUST | Teste unitário de crypto + inspeção de schema | F1 |
| SR-08 | Chave fora do código (secret manager/env), `key_version` persistida, rotação documentada e testada em ambiente de teste | MUST | Revisão + runbook + `ST-08` | F1/F4 |
| SR-09 | `access_token` não persistido por padrão; cache com TTL = `expires_in − 60s`; se persistido, mesmo esquema do refresh | MUST | Revisão de código + teste | F1 |
| SR-10 | Desconectar chama `https://oauth2.googleapis.com/revoke`, apaga `oauth_tokens` (hard delete) e registra auditoria | MUST | `ST-09` | F1 |
| SR-11 | `invalid_grant` classificado como falha permanente: `status = revoked`, sem retry, notificação ao usuário | MUST | `ST-10` | F1 |
| SR-12 | Nenhum token/code/secret em resposta de API, HTML, storage do navegador ou mensagem de erro | MUST | `ST-11` (grep em logs e respostas) | F1 |

## 3. Logs e redaction

| ID | Requisito | Nível | Verificação | Fase |
|---|---|---|---|---|
| SR-13 | Redaction obrigatória de `access_token`, `refresh_token`, `code`, `Authorization`, `Cookie`, `client_secret`, `code_verifier` | MUST | `ST-11` (grep por padrões) | F1 |
| SR-14 | Proibido logar corpo de e-mail, anexos, nome de arquivo e PII além do necessário; `user_ref`/`account_ref` apenas como hash | MUST | Revisão de amostra de logs + teste | F2 |

## 4. Sessão do app

| ID | Requisito | Nível | Verificação | Fase |
|---|---|---|---|---|
| SR-15 | Cookie de sessão com `HttpOnly; Secure; SameSite=Lax; Path=/` (prefixo `__Host-` quando possível) | MUST | `ST-12` (inspeção de headers) | F1 |
| SR-16 | Sessão server-side com `token_hash`; rotação do identificador no login; TTL absoluto 12 h e idle 2 h | MUST | Teste de integração | F1 |
| SR-17 | Logout revoga a sessão no banco e limpa cookies; sessão revogada retorna 401 | MUST | `ST-13` | F1 |
| SR-18 | CSRF double-submit (`mc_csrf` + `X-CSRF-Token`) em `POST/PUT/PATCH/DELETE` | MUST | `ST-14` | F1 |
| SR-19 | Validar `Origin`/`Referer` em rotas mutáveis; rejeitar origem fora da allowlist | MUST | `ST-14` | F1 |
| SR-20 | Rotacionar sessão no login e impedir fixation; limite de tentativas de autenticação com backoff | MUST | `ST-15`, `ST-16` | F1 |

## 5. Isolamento multi-tenant e autorização

| ID | Requisito | Nível | Verificação | Fase |
|---|---|---|---|---|
| SR-21 | `userId` **somente** da sessão; presença em body/query/path é ignorada ou rejeitada | MUST | `ST-17` | F1 |
| SR-22 | Repositórios exigem `userId` como primeiro parâmetro; toda query inclui `WHERE user_id = $1`; proibido acesso direto ao banco fora de repositórios | MUST | Revisão arquitetural + lint customizado/teste | F1/F4 |
| SR-23 | Recurso de outro usuário ou inexistente → `404` uniforme (sem distinguir); IDs públicos UUIDv7 | MUST | `ST-17`, `ST-18` | F1 |
| SR-24 | RLS habilitada nas tabelas de domínio (defesa em profundidade) e separação de papéis (`user`, `admin`); admin não lê conteúdo de terceiros sem justificativa auditada | MUST | Teste de integração com `app.user_id` + revisão | F4 |

## 6. Validação de entrada e envio

| ID | Requisito | Nível | Verificação | Fase |
|---|---|---|---|---|
| SR-25 | Zod em 100 % das rotas, com limites explícitos (tamanho de corpo, quantidade de destinatários, tamanho de anexos) | MUST | Revisão + testes de limite (`ST-19`) | F1/F3 |
| SR-26 | HTML de e-mail sanitizado por allowlist de tags/atributos; remover `script`, `iframe`, `object`, `on*`, `javascript:`, `data:` perigosos | MUST | `ST-20` (fixtures maliciosas) | F2 |
| SR-27 | `From` definido pelo servidor a partir da conta conectada; assunto e destinatários normalizados e sem CR/LF | MUST | `ST-21` | F3 |
| SR-28 | Envio idempotente (`Idempotency-Key`), consulta por `rfc822msgid` em timeout, sem reenvio cego | MUST | `ST-22` | F3 |

## 7. Anexos

| ID | Requisito | Nível | Verificação | Fase |
|---|---|---|---|---|
| SR-29 | Servir anexos como `attachment`, com `X-Content-Type-Options: nosniff`; nunca inline para `text/html`/SVG | MUST | `ST-23` | F2 |
| SR-30 | Imagens remotas de e-mail bloqueadas por padrão ou via proxy com allowlist de esquema/host e bloqueio de IP privado/loopback (anti-SSRF) | SHOULD | `ST-24` | F2 |
| SR-31 | Nome de arquivo sanitizado (remove `/`, `\`, `..`, controles, RTL override); limite de 25 MB; download em streaming | MUST | `ST-25`, `ST-23` | F2/F3 |

## 8. Observabilidade e auditoria

| ID | Requisito | Nível | Verificação | Fase |
|---|---|---|---|---|
| SR-32 | Logs estruturados JSON com `request_id`, rota, status, duração, códigos de erro (sem conteúdo sensível) | MUST | Revisão de amostra + `ST-26` | F1 |
| SR-33 | Acesso aos logs restrito, retenção definida e proteção contra alteração (append-only/centralizado) | MUST | Revisão de infraestrutura | F4 |
| SR-34 | `audit_log` append-only com eventos: login, connect, disconnect, revoked, sync.started/completed/failed, thread.viewed, attachment.downloaded, message.sent, access.denied, privacy.export, privacy.delete | MUST | `ST-27` | F2/F4 |
| SR-35 | Auditoria retida por ≥ 12 meses, sem corpo de e-mail; consulta restrita a admin | MUST | Revisão + política | F4 |

## 9. Rate limiting e resiliência

| ID | Requisito | Nível | Verificação | Fase |
|---|---|---|---|---|
| SR-36 | Rate limit por IP e por usuário/conta em auth, sync, envio e download; `429` com `Retry-After` | MUST | `ST-28` | F3/F4 |
| SR-37 | Circuit breaker e backoff exponencial com jitter para 429/5xx do Gmail; máximo 5 tentativas; `status = degraded` | MUST | Teste unitário do cliente + `ST-29` | F2 |

## 10. Infra, segredos e supply chain

| ID | Requisito | Nível | Verificação | Fase |
|---|---|---|---|---|
| SR-38 | Backups criptografados com chave separada, expiração e **restore testado** | MUST | `ST-30` + evidência de restore | F4 |
| SR-39 | Segredos apenas em secret manager/`EnvironmentFile` com `0600`; `.env` fora do repo; `gitleaks` no CI | MUST | CI `gitleaks` limpo | F0/F4 |
| SR-40 | Lockfile commitado, `npm audit`/`osv-scanner` sem High/Critical, dependabot habilitado, pinagem de versões | MUST | CI | F0/F4 |
| SR-41 | TLS 1.2+ obrigatório, HSTS habilitado, redirecionamento HTTP→HTTPS | MUST | `ST-31` | F4 |
| SR-42 | Headers: `Content-Security-Policy` (sem `unsafe-inline` desnecessário), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'` | MUST | `ST-32` | F4 |
| SR-43 | CORS com allowlist de origem; proibido `*` com credenciais | MUST | `ST-33` | F4 |
| SR-44 | Serviço systemd com usuário não-root, `NoNewPrivileges`, `ProtectSystem=strict`, `PrivateTmp`, `EnvironmentFile` restrito | SHOULD | Revisão de unit file | F4 |

## 11. LGPD

| ID | Requisito | Nível | Verificação | Fase |
|---|---|---|---|---|
| SR-45 | Consentimento explícito no fluxo, tela com escopos e finalidade; política de privacidade pública linkada | MUST | Revisão + `ST-34` | F1/F4 |
| SR-46 | Retenção configurável e job de expurgo testado (padrão 90 dias após desconexão) | MUST | `ST-35` | F4 |
| SR-47 | Exportação (`GET /api/privacy/export`) e exclusão (`DELETE /api/privacy/account-data`) auditadas e com prazo | MUST | `ST-36` | F4 |
| SR-48 | ROPA, DPO definido, subprocessador Google documentado e runbook de incidente (referência 72 h) | MUST | Documento + `ST-37` | F4 |

## 12. Decisões que o BACKDEV não pode renegociar

1. Nenhuma credencial em repositório, imagem, log ou frontend.
2. Nenhuma rota aceita `userId`/`accountId` sem validar propriedade na sessão.
3. Nenhum recurso compartilhado entre usuários, nem em cache.
4. Nenhum retry infinito em erro permanente do Google.
5. Nenhum HTML de e-mail renderizado sem sanitização.
6. Nenhum merge com `gitleaks` ou `npm audit` crítico em aberto.
7. Nenhuma alteração no serviço `mailchat.service` em produção sem janela e backup.

## 13. Resumo de bloqueios para go-live

Todos os **MUST** de SR-01 a SR-48 precisam estar implementados e verificados. Os testes
`ST-01`..`ST-37` classificados como críticos devem estar verdes, e o laudo KALIMASTER não pode
conter achados Critical/High abertos.
