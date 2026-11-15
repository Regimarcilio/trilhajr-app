# Runbook — MailChat multiusuário (infra #22)

- **Issue:** [#22](https://github.com/Regimarcilio/trilhajr-app/issues/22) · partes de [#12](https://github.com/Regimarcilio/trilhajr-app/issues/12)/[#13](https://github.com/Regimarcilio/trilhajr-app/issues/13)
- **Fase:** F0/F4 — **preparação**. Nenhum deploy foi executado.
- **Artefatos:** `compose.prod.yml`, `backend.Dockerfile`, `proxy/nginx.conf.example`,
  `systemd/*`, `backup/*`, `observability/*`.
- **Documentos irmãos:** `docs/security/checklist-deploy.md`,
  `docs/security/requisitos-hardening.md` (SR-38..SR-44), `docs/gmail/arquitetura.md`,
  `docs/gmail/SRS-gmail-oauth2.md` §16.

> ⚠️ **Regra de ouro:** `mailchat.service` (user unit, escuta `*:3100`) não pode
> ser reiniciado, parado ou alterado sem aprovação explícita e janela. Portas
> **80/443/3100/8787** não devem ser ocupadas por testes deste repositório.
> Nenhum segredo real deve ser criado/versionado nesta fase.

## 1. Status e escopo

| Item | Status |
|---|---|
| Dockerfile, Compose e init de papéis | preparado e validado com `docker compose config` |
| Proxy TLS/HSTS + redirect | preparado; `nginx -t` validado com cert temporário |
| systemd hardened + drop-in | preparado; `systemd-analyze verify` executado com ressalvas (unit não instalado) |
| Backup criptografado + restore | script e procedimento preparados; **nenhum backup/restore executado** |
| Alertas e métricas | regras/documentação preparadas; Prometheus **não** instalado |
| Domínio, DNS, certificado, canal de alerta, destino offsite | **pendentes do usuário** (§4) |

## 2. Topologia e portas

```text
Internet :443 ──► Nginx (host, TLS 1.2/1.3, HSTS)
                    ├── /        ──► 127.0.0.1:3100  mailchat.service (INTOCADO)
                    └── /api/*   ──► 127.0.0.1:8787  backend (Compose/systemd)
                                             │
                                             ├── rede data (interna) ──► postgres:5432 (sem porta pública)
                                             └── rede egress ──► Gmail API (HTTPS)
Prometheus :9090 ── scrape 127.0.0.1:8787/metrics e :9100 (host)
```

| Porta | Serviço | Exposição | Observação |
|---|---|---|---|
| 80 | Nginx | pública | apenas ACME + redirect 301 |
| 443 | Nginx | pública | TLS 1.2+ |
| 3100 | `mailchat.service` | `*:3100` (exposto; bloquear via firewall/P14) | não tocar; frontend atual |
| 8787 | backend | `127.0.0.1` | health/metrics |
| 5432 | Postgres | **sem publish** no Compose | há um 5432 já em uso no host; não conflita |
| 5434 | Postgres de dev | `127.0.0.1` | compose do backend (fora deste escopo) |
| 6379 | Redis | **sem publish**; profile | desligado por padrão |
| 9090/9093/9100/9115 | observabilidade | loopback | pendente de instalação |

## 3. Decisões desta preparação

1. **Proxy: Nginx** (não Caddy).
   - Já instalado no host (1.24), sem novo runtime.
   - Permite validar a configuração offline com `nginx -t` nesta fase.
   - TLS 1.2/1.3, redirect e HSTS explícitos; renovação automática via
     certbot/systemd timer (instalação e provedor pendentes — §4).
   - Caddy seria mais simples para ACME automático, mas exigiria instalar um
     segundo proxy e não permitiria a mesma validação local.
2. **Compose é o caminho recomendado neste host** (app + Postgres na mesma
   rede privada, app publicado só em loopback). O **systemd nativo** fica como
   alternativa para ambientes com Postgres gerenciado/alcançável por TCP; a
   escolha final é pendência (§4).
3. **Segredos**: `EnvironmentFile`/`env_file` 0600, fora da imagem e do repo.
   Nada de segredo em `compose.prod.yml`. Docker secrets podem substituir os
   env files no futuro, mas o backend F0 só lê variáveis de ambiente.
4. **Postgres**: `mailchat_owner` (DDL/migrations) e `mailchat_app` (DML,
   `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, `NOBYPASSRLS`, connection limit).
   O init só roda em volume vazio; em volume existente, aplicar o SQL manual.
5. **Redis desligado por padrão**. O SRS (P-06 / arquitetura §1.7) aceita rate
   limit em memória em instância única. Habilite `--profile redis` apenas com
   múltiplas instâncias/fila persistente e justificativa registrada.
6. **Backup**: `pg_dump --format=custom` → `pg_restore --list` (verificação) →
   GPG AES256 com chave pública; chave privada offline; retenção 14 dias;
   checksum + metadados; métrica textfile. Destino offsite é pendência.
7. **Observabilidade**: Prometheus + Alertmanager + node_exporter; logs no
   journald com retenção de 90 dias/2 GB. `/metrics` não é público.
8. **Hardening do host**: app non-root 10001, `read_only`, `cap_drop: ALL`,
   `no-new-privileges`, tmpfs; unit systemd com `ProtectSystem=strict`,
   `ProtectHome`, `PrivateTmp`, `NoNewPrivileges`, `RestrictAddressFamilies`.

## 4. PENDÊNCIAS DO USUÁRIO (bloqueiam a publicação)

| # | Decisão | Por que | Proposta padrão | Bloqueia? |
|---|---|---|---|---|
| P1 | **Domínio/subdomínio + DNS** (A/AAAA) | necessário para TLS, cookies `Secure` e `redirect_uri` | `mailchat.<dominio>` apontando para o host | sim |
| P2 | **Provedor TLS**: Let's Encrypt (certbot) ou certificado corporativo | renovação automática e HSTS | Let's Encrypt + timer certbot; aprovar instalação do certbot | sim |
| P3 | **Destino de backup offsite** + custódia da chave GPG privada | SR-38 exige backup recuperável; disco local não é suficiente | objeto S3/B2/rsync para host separado; chave offline | sim |
| P4 | **Canal de alerta e on-call** | alertas sem destino não notificam | e-mail + Telegram/Slack; horário comercial | sim |
| P5 | **Aprovação de custo** | VPS/domínio/backup/monitoramento | ver §13; incremental estimado R$ 0–100/mês | sim |
| P6 | **Caminho de deploy**: Compose ou systemd nativo | define o passo a passo e o hardening aplicável | Compose neste host | sim |
| P7 | **Janela e go/no-go** | mudanças em produção | janela de 60–90 min, fora de pico | sim |
| P8 | **Geração/guarda das senhas** (owner/app) e do `TOKEN_ENCRYPTION_KEY`/`SESSION_SECRET` | perda = reconexão de todos; vazamento = incidente | secret manager ou cofre; nunca no repo | sim |
| P9 | **Instalação de pacotes** (certbot, Prometheus, Alertmanager, node_exporter, exporters) | não instalar nesta fase | aprovar versões/pacotes | sim |
| P10 | **Google Cloud/OAuth** (projeto, scopes, redirect URI, CASA/Testing) | F1/F4; paralelo | fluxo já documentado em `docs/gmail/` | não (paralelo) |
| P11 | **RPO/RTO oficiais** | restore e contrato de operação | RPO 24 h / RTO 2 h | sim |
| P12 | **DPO, política de privacidade e contato de incidente** | SR-48/LGPD | documentos já previstos em `docs/gmail/plano-verificacao-google-lgpd.md` | sim |
| P13 | **Redis será habilitado?** | muda a topologia/porta e o rate limit | não nesta fase | não |
| P14 | **Firewall**: 3100/8787 devem ficar em loopback? | 3100 está em `*:3100` hoje | bloquear 3100/8787 externamente no firewall | sim |

> Sem P1–P8, a issue pode ser revisada/mergeada como preparação, mas **não há
> go-live**.

## 5. Pré-requisitos do servidor

- Ubuntu 24.04 (host atual), Docker 29 + Compose 2.40, Nginx 1.24.
- Node 22.18+ apenas no caminho systemd nativo (`/usr/bin/node`).
- DNS propagado; portas 80/443 liberadas; 3100/8787 bloqueados externamente (firewall; 3100 hoje em `*:3100`).
- Disco com folga para imagens, Postgres, backups e journald (mínimo 20 GB livres).
- Acesso administrativo e janela aprovada.

### 5.1 Preflight (somente leitura)

```bash
# Serviços e portas (não deve haver backend em 8787 antes do deploy)
systemctl --user status mailchat.service --no-pager
ss -ltnp | grep -E ':(80|443|3100|8787|5432|5434)\b' || true

# Configuração sem subir nada
cd email-whatsapp/infra
POSTGRES_PASSWORD=__dummy__ MAILCHAT_APP_PASSWORD=__dummy__ \
  docker compose -f compose.prod.yml config >/dev/null

# Sintaxe do Nginx (com config temporária; ver §8)
```

### 5.2 Criar papéis em volume Postgres já existente

O `postgres/init/10-app-role.sh` só roda no primeiro boot. Se o volume já
existir, execute como owner (sem imprimir senha):

```bash
docker compose -f compose.prod.yml exec -T postgres sh -ec \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1'
# No prompt, defina \set app_user ... e \set app_password ... e cole o SQL de
# postgres/init/10-app-role.sh (sem imprimir a senha no terminal).
```

Alternativa: recriar o volume (destrutivo) apenas em ambiente novo. Em produção,
nunca recriar volume com dados sem backup validado.

## 6. Janela de deploy (ordem recomendada)

### 6.1 Congelar e comunicar
- Anunciar janela, escopo e rollback.
- Confirmar que `mailchat.service` está `active` e que ninguém fará deploy do
  frontend durante a janela.
- Congelar merges em `develop` até o smoke test.

### 6.2 Backup antes de qualquer mudança

```bash
sudo install -d -m 0700 /var/backups/mailchat
sudo BACKUP_GPG_RECIPIENT='<chave-publica>' BACKUP_DIR=/var/backups/mailchat \
  ./backup/backup.sh
# validar: .dump.gpg, .sha256 e .meta; rodar o procedimento de restore em ambiente isolado
```

Se o banco ainda não existir (primeiro deploy), pule; registre "sem dados".

### 6.3 Segredos (operador, no servidor)

```bash
umask 077
install -m 0600 ./.env.example ./.env
install -m 0600 ./env/backend.env.example ./env/backend.env
install -m 0600 ./env/migrate.env.example ./env/migrate.env
# preencher com valores reais; nunca commitar
```

Checagens:

```bash
stat -c '%a %U:%G %n' ./.env ./env/backend.env ./env/migrate.env
# 600 <user>:<group> ...
```

- `./.env`: `POSTGRES_PASSWORD`, `MAILCHAT_APP_PASSWORD`, domínio/e-mail.
- `./env/backend.env`: `DATABASE_URL` do **app** (`mailchat_app`), segredos
  OAuth (F1).
- `./env/migrate.env`: `DATABASE_URL` do **owner** (só migrations).

### 6.4 Build + gates

```bash
cd email-whatsapp/infra
docker compose -f compose.prod.yml build app
docker compose -f compose.prod.yml build migrate

# Gates (executar também no CI/PR)
gitleaks detect --no-banner --redact        # se disponível
(cd ../backend && npm audit --omit=optional --audit-level=high)
docker history --no-trunc mailchat-backend:local | grep -iE 'secret|password|token' || true
```

### 6.5 Banco: subir, migrar, validar

```bash
docker compose -f compose.prod.yml up -d postgres
docker compose -f compose.prod.yml ps
docker compose -f compose.prod.yml --profile migrate run --rm migrate
docker compose -f compose.prod.yml exec -T postgres \
  psql -U mailchat_owner -d mailchat -c '\dt'
```

- Migrations rodam como owner; o app usa `mailchat_app` (DML only).
- Se migration falhar, **não** iniciar o app; restaurar backup se necessário.

### 6.6 Subir a aplicação

```bash
docker compose -f compose.prod.yml up -d app
curl -fsS http://127.0.0.1:8787/health
# {"status":"ok"}
curl -fsS http://127.0.0.1:8787/metrics | head
```

Aguarde `healthy` no `docker compose ps`. O F0 não tem rotas `/api/*`; um 404
nessas rotas é esperado até F1.

### 6.7 Proxy + TLS

1. Instalar/validar a config do Nginx (§8).
2. Emitir o certificado (certbot standalone/webroot, conforme P2).
3. `sudo nginx -t` e `sudo systemctl reload nginx`.
4. Validar redirect/HSTS/TLS (§9.7).

### 6.8 Smoke test mínimo

```bash
curl -sI http://<dominio>/ | head -n 5          # 301 Location https://...
curl -sI https://<dominio>/ | grep -i strict-transport-security
curl -fsS https://<dominio>/health              # backend via proxy
curl -fsS http://127.0.0.1:3100/ >/dev/null     # frontend INTACTO
systemctl --user is-active mailchat.service     # active
```

Smoke completo (quando F1 existir): login, conectar conta de teste, listar
thread, baixar anexo, enviar reply.

### 6.9 Observar 30 min

```bash
journalctl -u mailchat-backend -f            # se systemd
docker compose -f compose.prod.yml logs -f app
curl -fsS http://127.0.0.1:8787/metrics | grep -E '5..|429'
```

Critérios: sem 5xx sustentado, sem 429 anormal, disco estável, `mailchat.service`
na 3100 intocado.

### 6.10 Backup automatizado (somente na janela)

O unit usa `ProtectHome=true`; por isso o Compose e o `.env` precisam estar em
`/opt/mailchat/infra` (root), não em `/home`. O `backup.env` não contém senha:
ele aponta para o `.env` usado só na interpolação do Compose.

```bash
# Layout root-only
sudo install -d -m 0755 /opt/mailchat
sudo cp -a . /opt/mailchat/infra
sudo chown -R root:root /opt/mailchat/infra
sudo chmod 0600 /opt/mailchat/infra/.env   /opt/mailchat/infra/env/backend.env /opt/mailchat/infra/env/migrate.env
sudo install -d -m 0750 /etc/mailchat
sudo install -d -m 0700 /var/backups/mailchat /var/lib/mailchat-backup/gnupg
sudo install -d -m 0755 /var/lib/node_exporter/textfile

sudo install -m 0750 backup/backup.sh /usr/local/sbin/mailchat-backup.sh
sudo install -m 0600 backup/backup.env.example /etc/mailchat/backup.env
# editar /etc/mailchat/backup.env: BACKUP_GPG_RECIPIENT e conferir
# BACKUP_COMPOSE_FILE/BACKUP_COMPOSE_ENV_FILE/BACKUP_TEXTFILE_DIR.

sudo GNUPGHOME=/var/lib/mailchat-backup/gnupg   gpg --import /caminho/offline/mailchat-backup-public.asc

sudo install -m 0644 systemd/mailchat-backup.service.example   /etc/systemd/system/mailchat-backup.service
sudo install -m 0644 systemd/mailchat-backup.timer.example   /etc/systemd/system/mailchat-backup.timer
sudo systemd-analyze verify /etc/systemd/system/mailchat-backup.service
sudo systemctl daemon-reload
sudo systemctl enable --now mailchat-backup.timer
sudo systemctl start mailchat-backup.service
sudo journalctl -u mailchat-backup -n 50 --no-pager
```

Valide: `.dump.gpg`, `.sha256`, `.meta` em `/var/backups/mailchat`, métricas
`mailchat-backup*.prom` em `/var/lib/node_exporter/textfile` e **restore em
ambiente isolado** (`backup/restore.md`). Se o stack estiver parado, o backup
falha (correto); o alerta `MailchatBackupFailed` dispara.

## 7. Caminho alternativo: systemd nativo

Use se o Postgres for gerenciado/alcançável por TCP e você quiser o hardening
do unit. **Não** use o Postgres do Compose sem publicar uma porta loopback
(overrides dedicados, fora deste arquivo).

```bash
# Usuário dedicado (sem shell/home gravável)
sudo useradd --system --no-create-home --shell /usr/sbin/nologin \
  --user-group mailchat-api

# Artefatos root:root 0755
sudo install -d -m 0755 /opt/mailchat/backend
sudo rsync -a --delete ../backend/dist/ ../backend/node_modules/ ../backend/package.json /opt/mailchat/backend/
sudo chown -R root:root /opt/mailchat/backend

# Ambiente 0600
sudo install -d -m 0750 /etc/mailchat
sudo install -m 0600 env/backend.env.example /etc/mailchat/backend.env
# editar HOST=127.0.0.1 e DATABASE_URL antes de iniciar

# Unit + drop-in
sudo install -m 0644 systemd/mailchat-backend.service.example \
  /etc/systemd/system/mailchat-backend.service
sudo install -d -m 0755 /etc/systemd/system/mailchat-backend.service.d
sudo install -m 0644 systemd/mailchat-backend.service.d/10-hardening.conf.example \
  /etc/systemd/system/mailchat-backend.service.d/10-hardening.conf
sudo systemd-analyze verify /etc/systemd/system/mailchat-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now mailchat-backend.service   # SOMENTE na janela
```

No caminho systemd, o serviço escuta `127.0.0.1:8787` (env). No Compose, o container escuta `0.0.0.0:8787`, mas a porta é publicada apenas em `127.0.0.1:8787`. Nenhum dos dois conflita com a 3100.

## 8. TLS e proxy

- Arquivo: `proxy/nginx.conf.example` (standalone). Substitua
  `mailchat.example.com` e os caminhos do certificado.
- Validação offline (sem bind em 80/443/3100/8787):

```bash
tmp=$(mktemp -d /tmp/mailchat-nginx.XXXXXX)
openssl req -x509 -newkey rsa:2048 -nodes -days 1 \
  -subj '/CN=mailchat.example.test' \
  -keyout "$tmp/key.pem" -out "$tmp/cert.pem" >/dev/null 2>&1
sed -e "s|/etc/letsencrypt/live/mailchat.example.com/fullchain.pem|$tmp/cert.pem|" \
    -e "s|/etc/letsencrypt/live/mailchat.example.com/privkey.pem|$tmp/key.pem|" \
    -e "s|/var/log/nginx|$tmp|g" -e "s|/run/nginx.pid|$tmp/nginx.pid|" \
    -e 's/listen 80;/listen 18080;/' -e 's/listen \[::\]:80;/listen [::]:18080;/' \
    -e 's/listen 443 ssl http2;/listen 18443 ssl http2;/' \
    -e 's/listen \[::\]:443 ssl http2;/listen [::]:18443 ssl http2;/' \
    proxy/nginx.conf.example > "$tmp/nginx.conf"
nginx -t -c "$tmp/nginx.conf" -p "$tmp"   # 18080/18443; não usa 80/443/3100/8787
```

- Produção: `certbot certonly --webroot -w /var/www/certbot -d <dominio>` (ou
  certificado corporativo) + timer de renovação. HSTS só depois de validar
  HTTPS em todos os subdomínios (checklist 1.1).
- Firewall: apenas 80/443 públicos. 3100/8787 devem ser bloqueados na borda
  (hoje a 3100 aparece em `*:3100`; ver P14).
- `/metrics` retorna 404 no Nginx; scrape é local.

### 8.1 Métricas de backup (textfile)

O `backup.sh` escreve `mailchat-backup.prom` e `mailchat-backup-status.prom`.
O unit de backup já permite escrita em `/var/lib/node_exporter/textfile`; o
`node_exporter` (P9, ainda não instalado) deve ser iniciado com:

```bash
sudo install -d -m 0755 /var/lib/node_exporter/textfile
node_exporter --collector.textfile.directory=/var/lib/node_exporter/textfile
```

Os arquivos `.prom` são gravados com modo `0644` (contêm apenas timestamps,
tamanho e código de saída; nenhum segredo). O backup `.gpg` continua `0600`.

## 9. Operação e diagnóstico

### 9.1 Backend fora do ar
1. `docker compose -f compose.prod.yml ps` ou `systemctl status mailchat-backend`.
2. `journalctl -u mailchat-backend -n 100` / `docker compose logs --tail=100 app`.
3. `curl -v http://127.0.0.1:8787/health`.
4. Se o log mostrar `invalid_environment`, conferir `DATABASE_URL`/permissões do
   env file (a mensagem não expõe valores).
5. Não reiniciar `mailchat.service` (3100) como tentativa de correção.

### 9.2 Erros 5xx
- `journalctl -u mailchat-backend | grep request_failed`.
- Verificar Postgres (`pg_isready`), disco, pool e latência.
- Correlacionar `request_id` com logs; não logar corpo de e-mail.

### 9.3 429 e quota Gmail
- Métrica `mailchat_gmail_api_responses_total{status="429"}` e
  `mailchat_http_requests_total{status="429"}`.
- Conferir quota no Google Cloud; backoff/jitter já é requisito (SR-37).
- Confirmar que o rate limit do app está ativo e que não há bot/retry loop.

### 9.4 Falha de token ou sync
- `mailchat_gmail_token_failures_total`, `mailchat_sync_failures_total`.
- `invalid_grant` = revogação permanente: conta `revoked`, sem retry (SR-11).
- Conferir `key_version` e `TOKEN_ENCRYPTION_KEY`; nunca logar token.
- `historyId` 404 = full resync.

### 9.5 Disco e backup
```bash
df -h /
journalctl -u mailchat-backup -n 100
ls -lh /var/backups/mailchat | tail
sha256sum -c /var/backups/mailchat/<arquivo>.dump.gpg.sha256
```
- `MailchatBackupStale`/`MailchatBackupFailed`: corrigir timer/GPG/disco e rodar
  backup manual.
- Teste de restore trimestral: `backup/restore.md` §8.

### 9.6 Rotação de segredos
- **Senha do app**: `ALTER ROLE mailchat_app PASSWORD '<nova>'` (owner), atualizar
  `DATABASE_URL` no env, reiniciar o backend na janela.
- **Senha do owner**: atualizar `POSTGRES_PASSWORD` e `env/migrate.env`,
  recriar o container Postgres (não recria volume) na janela.
- **Chave GPG**: gerar novo par, importar pública, manter a privada antiga até
  expirar os backups antigos.
- **`TOKEN_ENCRYPTION_KEY`/`SESSION_SECRET`**: seguir SR-08/ADR-003; rotação com
  `key_version` é responsabilidade do backend (F1), não deste runbook.

### 9.7 Verificações TLS/headers
```bash
curl -sI http://<dominio>/ | head -n 8
curl -sI https://<dominio>/ | grep -iE 'strict-transport|content-security|x-content-type|referrer-policy|permissions-policy'
openssl s_client -connect <dominio>:443 -tls1_1 </dev/null 2>&1 | grep -E 'Protocol|handshake failure'
openssl s_client -connect <dominio>:443 -tls1_2 </dev/null 2>&1 | grep 'Protocol'
```

## 10. Rollback

1. **Aplicação**: voltar a tag anterior (`MAILCHAT_IMAGE_TAG=<anterior>`),
   `docker compose up -d app`; validar `/health`.
2. **Proxy**: restaurar o arquivo anterior do Nginx, `sudo nginx -t`, `sudo systemctl reload nginx`.
3. **Banco**: migrations são forward-only em produção. Restaurar backup somente
   com aprovação, janela e evidência de corrupção/incompatibilidade. Nunca rodar
   `db:rollback` em produção.
4. **Secrets**: reverter env files para a versão anterior (se a rotação causou o
   incidente) e reiniciar o backend.
5. **Frontend**: `mailchat.service` (3100) não faz parte do rollback; se algo
   nele mudou, tratar como incidente separado.
6. Revogar tokens emitidos na janela se houver suspeita.
7. Registrar post-mortem em `docs/dev-log.md`.

## 11. Critérios de aceite da issue (Gherkin)

| Cenário | Verificação objetiva | Status |
|---|---|---|
| HTTPS | `curl -sI http://<dominio>/` → 301; `curl -sI https://...` contém HSTS; `openssl s_client -tls1_1` falha | pendente de domínio/TLS |
| Segredos | `gitleaks` limpo; `docker history`/`docker save` sem segredo; env 0600; `.env` fora do git | offline: repo limpo; produção pendente |
| Restore | `backup/restore.md` executado em ambiente limpo, com data/responsável no §8 | pendente |
| Continuidade | `systemctl --user is-active mailchat.service` = active; `curl 127.0.0.1:3100` OK antes/depois | offline: serviço ativo, não tocado; produção pendente |

## 12. Segurança e segredos

- **Nunca** commitar `.env`, `env/*.env`, chaves, dumps ou `.pem`.
- Permissões: env files `0600`; backup dir `0700`; unit/drop-in `0644`; scripts
  `0750`; chave GPG privada fora do servidor.
- Imagem: sem `.env`, sem `drizzle` de runtime, sem devDependencies; usuário
  10001; `read_only`; `cap_drop: ALL`.
- Banco: app sem DDL/superuser; migrations como owner; RLS (SR-24) é trabalho de
  backend em F4.
- Logs: redaction do backend; journald restrito; nunca corpo de e-mail.
- O `mailchat.service` atual roda como usuário de login sem hardening; **não**
  alterar nesta issue (será tratado em issue própria, se aprovado).

## 13. Custo estimado (mensal, premissas)

| Item | Estimativa | Observação |
|---|---|---|
| VPS/host atual | R$ 0 incremental | já existe; validar RAM (Postgres + Prometheus) |
| Domínio | ~R$ 4–6/mês (R$ 40–70/ano) | depende do registrador |
| TLS | R$ 0 | Let's Encrypt; certificado corporativo pode ter custo |
| Backup offsite | R$ 5–30/mês | 10–100 GB em object storage ou host secundário |
| Monitoramento | R$ 0–100/mês | self-hosted (disco/RAM) ou SaaS free/paid |
| Alertas | R$ 0–20/mês | e-mail/Telegram grátis; SMS/webhook pode custar |
| **Total incremental** | **~R$ 10–160/mês** | aprovação em P5 |

Premissas: instância única, sem multi-região, retenção curta. Custos de Google
Cloud (Gmail API) são por quota e já previstos no SRS; não incluídos aqui.

## 14. Riscos e o que NÃO foi executado

**Não executado nesta preparação:**
- Nenhum container subiu; nenhum `docker compose up/build`.
- Nenhum unit foi instalado/habilitado; nenhum serviço reiniciado.
- `mailchat.service` (3100) não foi tocado.
- Nenhum segredo real foi gerado, copiado ou versionado.
- Nenhum DNS/TLS/ACME foi consultado; nenhum certificado real emitido.
- Nenhum backup/restore real foi executado (`pg_dump` não está no host; o script
  usa o container em produção).
- Prometheus/Alertmanager/exporters não foram instalados.
- Redis não foi iniciado.
- Rotas `/api/*` do F0 ainda não existem; smoke de API completa só em F1.

**Riscos conhecidos:**
- `mailchat.service` está em `*:3100` (não só loopback); depende de firewall (P14).
- Métricas de token/sync só existem após instrumentação F1/F2; alertas ficam
  silenciosos até lá (há alerta de métrica ausente).
- Certbot/Prometheus não estão instalados; a janela precisa prever instalação.
- `pg_dump`/`pg_restore` no host são versão 16 (Ubuntu), enquanto o servidor é 18;
  por isso o backup padrão é via container (`BACKUP_MODE=docker`).
- HSTS é difícil de reverter; ativar só após validar todos os subdomínios.
- O caminho systemd nativo exige um Postgres alcançável por TCP; o Compose atual
  não publica a 5432 (decisão P6).
- A imagem usa `node:22-alpine` (tag móvel); pinar por digest no deploy (SR-40).

## 15. Referências

- `docs/security/requisitos-hardening.md` — SR-38..SR-44
- `docs/security/checklist-deploy.md` — checklist original
- `docs/security/plano-testes-seguranca.md` — ST-30/ST-31/ST-32/ST-33
- `docs/gmail/arquitetura.md` — componentes, Redis opcional, fronteiras de confiança
- `docs/gmail/SRS-gmail-oauth2.md` §16 — observabilidade/auditoria
- `backend/README.md` — `/health`, `/metrics`, env Zod
