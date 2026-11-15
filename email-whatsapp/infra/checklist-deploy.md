# Checklist de deploy — MailChat infra #22 (preenchido)

- **Issue:** [#22](https://github.com/Regimarcilio/trilhajr-app/issues/22)
- **Base:** `docs/security/checklist-deploy.md` v1.0
- **Data da preparação:** 2026-11-15
- **Branch:** `DEV` (a partir de `origin/develop`)
- **Regra:** este checklist registra **preparação offline**. Nada foi executado
  em produção; `mailchat.service` (3100) não foi tocado.

**Legenda:** ✅ preparado/validado offline · ⏳ pendente de produção ou decisão · ➖ fora do escopo desta issue

## A. Requisitos SR-38..SR-44

| ID | Requisito | Status | Evidência / pendência |
|---|---|---|---|
| SR-38 | Backup criptografado, chave separada, expiração, restore testado | ✅ parcial | `backup/backup.sh` (GPG AES256, retenção, checksum, verificação `pg_restore --list`, métricas) + `backup/restore.md`. **Restore real ainda não executado.** |
| SR-39 | Segredos só em secret manager/`EnvironmentFile` 0600; `.env` fora do repo; gitleaks no CI | ✅ parcial | `infra/.gitignore`, `env/*.env.example`, runbook §6.3; nenhum segredo nos arquivos. `gitleaks` não está instalado no host de preparação; job de CI já existe. |
| SR-40 | Lockfile, audit sem High/Critical, dependabot, pinagem | ➖/⏳ | Lockfile e CI do backend já existem (F0). Imagem usa `node:22-alpine` (tag móvel) — pinar por digest no deploy. Dependabot não foi adicionado (fora do escopo desta issue). |
| SR-41 | TLS 1.2+, HSTS, redirect HTTP→HTTPS | ✅ config / ⏳ deploy | `proxy/nginx.conf.example` com `ssl_protocols TLSv1.2 TLSv1.3`, HSTS e `return 301`. Validado com `nginx -t` em portas temporárias. DNS/certificado pendentes. |
| SR-42 | Headers CSP, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors | ✅ parcial | Nginx adiciona `nosniff`, `Referrer-Policy`, `Permissions-Policy` e `CSP frame-ancestors 'none'`. CSP completa da aplicação é do backend/frontend (F4). |
| SR-43 | CORS com allowlist | ➖ | Código do backend/frontend (não alterado nesta issue). |
| SR-44 | systemd non-root, NoNewPrivileges, ProtectSystem=strict, PrivateTmp, EnvironmentFile restrito | ✅ preparado / ⏳ instalar | `systemd/mailchat-backend.service.example` + drop-in. `systemd-analyze verify` exit 0; `systemd-analyze security` = **1.5 OK**. Unit não instalado. |

## B. Seção 1 do checklist original

### 1.1 Domínio, TLS e rede

| Item | Status | Evidência / pendência |
|---|---|---|
| Domínio/subdomínio definido e apontando para o servidor | ⏳ | P1 do runbook; nenhum `dig` executado (proibido nesta fase). |
| TLS 1.2+ válido com renovação automática | ✅ config / ⏳ | Config pronta; certbot/provedor pendente (P2). |
| Redirect 301 HTTP→HTTPS | ✅ config | `location / { return 301 https://$host$request_uri; }` validado. |
| HSTS habilitado após validar HTTPS | ✅ config / ⏳ | Header no modelo; ativar em produção só após validar subdomínios. |
| Firewall: só 443 exposto; Postgres/Redis privados | ✅ Compose / ⏳ host | Postgres/Redis sem `ports`; redes `data` interna. Firewall do host pendente (P14; 3100 hoje em `*:3100`). |
| Proxy com limite ≥ 26 MB | ✅ | `client_max_body_size 30m`. |

### 1.2 Google e OAuth2

| Item | Status | Evidência / pendência |
|---|---|---|
| Projeto Google Cloud + Gmail API | ⏳ | P10; documentação em `docs/gmail/`. |
| Consent screen/escopos/redirect URI | ⏳ | P10; não alterado nesta issue. |
| `client_id`/`client_secret` fora do repo | ✅ modelo | `env/backend.env.example` só placeholders; nenhum valor real. |
| Test users/CASA | ⏳ | P10. |
| Domínio no Search Console | ⏳ | P1/P10. |

### 1.3 Segredos e configuração

| Item | Status | Evidência / pendência |
|---|---|---|
| Segredos em `EnvironmentFile` 0600 | ✅ modelo | `env/backend.env.example`, `env/migrate.env.example`, `backup/backup.env.example`; runbook §6.3. |
| `.env` fora do repositório e da imagem | ✅ | `infra/.gitignore`; `backend.Dockerfile.dockerignore` exclui `.env*`. |
| `gitleaks` no CI e local limpo | ✅ CI / ⏳ local | Job `secrets` existe no `mailchat-ci.yml`; binário ausente no host de preparação. |
| Chaves com backup seguro e acesso auditado | ⏳ | P3/P8; custódia offline. |
| Variáveis validadas na inicialização | ✅ | `backend/src/config/env.ts` (Zod, falha rápida sem expor valores). |

### 1.4 Banco e dados

| Item | Status | Evidência / pendência |
|---|---|---|
| Usuário de banco com privilégio mínimo | ✅ preparado | `postgres/init/10-app-role.sh`: `mailchat_app` sem superuser/createdb/createrole/bypassrls, DML only. |
| Migrations revisadas/testadas em banco limpo | ✅ F0 / ⏳ F1 | Perfil Compose `migrate` (owner) preparado; F0 já tinha migrations reversíveis. |
| RLS nas tabelas de domínio | ➖ | Trabalho de backend em F4 (SR-24). |
| Índices (`user_id`, `last_message_at`, `gmail_message_id`) | ➖ | Schema/backend (F2). |
| Backup automático criptografado com chave separada/expiração | ✅ preparado | `backup/backup.sh` + timer; retenção 14 d; GPG. |
| Restore testado em ambiente limpo, datado/responsável | ⏳ | `backup/restore.md` pronto; **não executado**. |

### 1.5 Aplicação

| Item | Status | Evidência / pendência |
|---|---|---|
| Headers de segurança completos | ✅ parcial | Nginx para headers de borda; CSP/CSRF/cookies são backend/frontend. |
| CORS allowlist | ➖ | Backend/frontend. |
| Cookies `HttpOnly; Secure; SameSite=Lax` | ➖ | F1 (backend). |
| CSRF em rotas mutáveis | ➖ | F1 (backend). |
| Rate limit ativo e testado | ➖ | F3/F4 (backend); Redis opcional. |
| Redaction de logs | ✅ F0 | `backend/src/logger/logger.ts` (redaction por chave + sanitização). |
| Auditoria gravando eventos | ➖ | F2/F4 (backend). |
| Sanitização de HTML de e-mail | ➖ | F2 (backend). |
| `npm audit`/`osv-scanner` sem High/Critical | ✅ F0 / ⏳ | CI do backend existe; `osv-scanner` não executado nesta preparação. |
| `gitleaks` limpo | ✅ CI / ⏳ local | Ver 1.3. |

### 1.6 Observabilidade

| Item | Status | Evidência / pendência |
|---|---|---|
| Logs centralizados com retenção e acesso restrito | ✅ modelo | journald 90 d/2 GB (metrics.md §5); driver `journald` no Compose. |
| Alertas 5xx, 429, token, sync, envios | ✅ regras / ⏳ | `observability/alerts.yml`; métricas de token/sync entram em F1/F2. |
| Painel de quota Gmail/Google Cloud | ⏳ | P10 + Prometheus/Grafana. |
| `/health` e `/metrics` protegidos | ✅ config | `/metrics` → 404 no Nginx; scrape local. `/health` exposto apenas via proxy. |

## C. Seção 2 — Deploy (tudo pendente)

| Item | Status | Evidência / pendência |
|---|---|---|
| Janela comunicada | ⏳ | P7. |
| Backup manual imediatamente antes | ⏳ | Procedimento no runbook §6.2; não executado. |
| Build reproduzível com lockfile | ✅ Dockerfile / ⏳ build | Multi-stage + `npm ci`; build não executado (proibido subir containers). |
| Migrations aplicadas com verificação | ⏳ | Perfil `migrate`; não executado. |
| Smoke test (`/health`, login, thread, anexo, reply) | ⏳ | F0 só tem `/health`; F1+ necessário. |
| Serviço antigo (3100) íntegro/trocado conforme plano | ✅ offline | `mailchat.service` ativo e não tocado; verificação em produção pendente. |
| Rollback ensaiado | ⏳ | Procedimento documentado no runbook §10; não ensaiado. |

## D. Seção 3 — Pós-deploy

| Item | Status |
|---|---|
| Revisar logs 30 min | ⏳ |
| Confirmar auditoria de conexão/sync | ⏳ (F1/F2) |
| Cookies/headers via `curl -I`/DevTools | ⏳ |
| ZAP baseline/Nuclei autorizados | ⏳ |
| Quota e latência p95 | ⏳ |
| Registrar evidências no PR/issue | ⏳ |

## E. Seção 4 — Contínuo

| Item | Status |
|---|---|
| Scan semanal de dependências/segredos | ⏳ |
| Revisão mensal de acessos | ⏳ |
| Revisão trimestral do threat model | ⏳ |
| Teste de restore trimestral | ⏳ |
| Rotação de chaves semestral/suspeita | ⏳ |
| Revisão de retenção/expurgo | ⏳ |
| Recertificação CASA anual | ⏳ |

## F. Seção 5 — Gate de go-live (binário)

| # | Critério | Status |
|---|---|---|
| 1 | Threat model aprovado/revisado | ⏳ |
| 2 | MUST de SR-01..SR-48 implementados | ⏳ (F1..F4) |
| 3 | ST-11/17/20/22/28 verdes | ⏳ |
| 4 | Laudo KALIMASTER sem Critical/High aberto | ⏳ |
| 5 | Backup criptografado + restore comprovado | ⏳ (script pronto; restore não executado) |
| 6 | Verificação Google/CASA ou Testing formalizado | ⏳ |
| 7 | Política de privacidade/termos publicados | ⏳ |
| 8 | Plano de incidente + DPO | ⏳ |

> **Gate permanece FECHADO.** Nenhum item de produção foi marcado como
> concluído nesta preparação.

## G. Critérios de aceite da issue #22

| Cenário Gherkin | Verificação | Status |
|---|---|---|
| HTTPS | redirect 301 + HSTS + TLS 1.2+ | ⏳ pendente de DNS/TLS |
| Segredos | repo/imagem sem segredo; env 0600 | ✅ offline (varredura local); ⏳ produção |
| Restore | restore em ambiente limpo com registro | ⏳ |
| Continuidade | 3100 ativo antes/depois | ✅ offline (serviço ativo, não tocado); ⏳ janela |

## H. Evidências de validação offline (executadas)

| Comando | Exit | Resultado |
|---|---|---|
| `docker compose -f compose.prod.yml config` (com dummies) | 0 | Config válida; app publica só `127.0.0.1:8787`; Postgres/Redis sem portas; redes `data`/`egress` com prioridade. |
| `docker compose -f compose.prod.yml --profile migrate --profile redis config` | 0 | Perfis `migrate`/`redis` válidos. |
| `docker compose -f compose.prod.yml config` (sem `.env`) | 1 | Falha rápida e clara: `POSTGRES_PASSWORD ... missing`. Comportamento desejado. |
| Parser YAML (`compose.prod.yml`, `alerts.yml`, `prometheus.yml.example`) | 0 | 3 arquivos válidos. |
| `nginx -t` com config temporária (portas 18080/18443, cert self-signed) | 0 | Sintaxe OK; aviso esperado do `user` por não ser root. **Sem bind em 80/443/3100/8787.** |
| `systemd-analyze verify` (backend unit + drop-in) | 0 | Unit válido. |
| `systemd-analyze security --offline=yes` (backend) | 0 | Exposure **1.5 OK**. |
| `systemd-analyze security --offline=yes` (backup) | 0 | Exposure **2.1 OK**. |
| `systemd-analyze verify` (backup service) | 1 | Esperado: `/usr/local/sbin/mailchat-backup.sh` não instalado. |
| `systemd-analyze verify` (backup timer) | 0 | Timer válido. |
| `bash -n backup/backup.sh` | 0 | Sintaxe OK. |
| `sh -n postgres/init/10-app-role.sh` | 0 | Sintaxe OK. |
| `backup.sh --check` (dummy, sem tocar no banco) | 0 | Dependências/config OK; aviso de chave GPG ausente. |
| `backup.sh --check` sem `BACKUP_GPG_RECIPIENT` | 2 | Falha intencional de configuração. |
| Fluxo completo do backup com `docker` stub + chave GPG efêmera | 0 | `.gpg` 0600, `.sha256`/`.meta` e métricas 0644; checksum OK. |
| Falha simulada do `pg_dump` | 9 | Status `exit_code=9` registrado; métrica de último sucesso preservada. |
| `git diff --check` | 0 | Sem whitespace/conflito. |
| `grep` de padrões de chave/token em `infra/` | 0 | Nenhum segredo encontrado. |

**Ferramentas ausentes no host de preparação:** `shellcheck`, `gitleaks`,
`promtool`, `caddy`, `pg_dump`/`pg_restore` 18. Por isso: `bash -n` no lugar de
`shellcheck`; validação YAML no lugar de `promtool`; backup padrão via container.

## I. Restrições cumpridas nesta fase

- [x] Nenhum deploy/container iniciado.
- [x] Nenhum unit instalado/habilitado.
- [x] Nenhum serviço reiniciado; `mailchat.service` (3100) intocado.
- [x] Nenhum segredo real criado/versionado.
- [x] Nenhuma chamada externa de DNS/TLS/ACME.
- [x] Nenhum arquivo fora de `email-whatsapp/infra/**` e `docs/dev-log.md` alterado.
- [x] Nenhum merge.
