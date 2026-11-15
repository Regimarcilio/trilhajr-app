# MailChat — Infraestrutura (issue #22)

Preparação de infra multiusuário para o backend MailChat: imagem de produção,
Compose privado, proxy TLS, systemd hardened, backup criptografado e
observabilidade. **Nada aqui foi publicado.** Consulte o
[runbook](runbook.md) antes de qualquer comando em produção.

## Estrutura

```text
infra/
├── backend.Dockerfile              # multi-stage, runtime non-root, healthcheck
├── backend.Dockerfile.dockerignore
├── compose.prod.yml                # app + Postgres (+ Redis por profile)
├── .env.example                    # interpolação do Compose (0600 no servidor)
├── env/
│   ├── backend.env.example         # runtime do app (0600)
│   └── migrate.env.example         # one-off de migrations como owner (0600)
├── postgres/init/10-app-role.sh    # papel DML least-privilege
├── proxy/nginx.conf.example        # TLS 1.2+, HSTS, redirect, /api e / (3100)
├── systemd/                        # unit + drop-in + backup service/timer
├── backup/
│   ├── backup.sh                   # pg_dump + GPG + retenção + métricas
│   ├── backup.env.example
│   └── restore.md                  # procedimento testável + registro
├── observability/
│   ├── alerts.yml                  # 5xx, 429, token/sync, disco, backup
│   ├── metrics.md                  # contrato /metrics e retenção de logs
│   └── prometheus.yml.example
├── runbook.md                      # janela, ordem, rollback, pendências
└── checklist-deploy.md             # status/evidências (offline vs produção)
```

## Caminhos

- **Recomendado neste host:** `compose.prod.yml` (app + Postgres em rede
  privada; app publicado só em `127.0.0.1:8787`).
- **Alternativa:** `systemd/mailchat-backend.service.example` + drop-in, para
  Postgres gerenciado/alcançável por TCP.
- **Borda:** Nginx no host; `/` → `127.0.0.1:3100` (`mailchat.service`,
  **intocado**) e `/api/*` → `127.0.0.1:8787`.

## Validação offline

```bash
cd email-whatsapp/infra

# Compose (não sobe nada)
POSTGRES_PASSWORD=__dummy__ MAILCHAT_APP_PASSWORD=__dummy__ \
  docker compose -f compose.prod.yml config >/dev/null

# Scripts
bash -n backup/backup.sh
sh -n postgres/init/10-app-role.sh

# systemd (unit não instalado; copie para a extensão .service)
tmp=$(mktemp -d)
cp systemd/mailchat-backend.service.example "$tmp/mailchat-backend.service"
systemd-analyze verify "$tmp/mailchat-backend.service"
rm -rf "$tmp"

# Nginx (config temporária, sem bind em 80/443/3100/8787)
# ver runbook §8
```

## Segurança

- Sem segredos no repositório, no Compose ou na imagem.
- `EnvironmentFile`/`env_file` com `0600`; `.env` fora do git.
- App non-root (10001), `read_only`, `cap_drop: ALL`, `no-new-privileges`.
- Postgres/Redis sem porta publicada; app usa `mailchat_app` (DML only).
- Backup GPG com chave privada offline; retenção e checksum.
- `/metrics` não é público.

## Pendências do usuário

Domínio/DNS, provedor TLS, destino de backup offsite, canal de alerta,
aprovação de custo, caminho de deploy (Compose vs systemd), janela e go/no-go.
Lista completa e bloqueios em [runbook.md §4](runbook.md#4-pendências-do-usuário-bloqueiam-a-publicação).

## Referências

- [Runbook](runbook.md)
- [Checklist de deploy](checklist-deploy.md)
- [Backup/restore](backup/restore.md)
- [Métricas](observability/metrics.md)
- `../docs/security/requisitos-hardening.md` (SR-38..SR-44)
