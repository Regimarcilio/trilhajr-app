# Observabilidade — MailChat

- **Issue:** [#22](https://github.com/Regimarcilio/trilhajr-app/issues/22)
- **Requisitos:** SR-32, SR-33, RNF-GM-08, RNF-GM-09
- **Artefatos:** `alerts.yml`, `prometheus.yml.example`, `../systemd/mailchat-backup.*`, `../backup/backup.sh`
- **Status:** preparação offline. Nenhum Prometheus/Alertmanager instalado nesta fase.

## 1. Topologia de observabilidade

```text
backend systemd/container :8787 ──scrape──┐
                                          ├── Prometheus :9090 ── Alertmanager :9093 ── canal (pendente)
node_exporter :9100 (disco) ──────────────┤
blackbox_exporter :9115 (TLS, opcional) ──┘
        ▲
        └── textfile collector: /var/lib/node_exporter/textfile/mailchat-backup.prom
                                   /var/lib/node_exporter/textfile/mailchat-backup-status.prom
                                   (escritos por backup.sh)
```

- **Métricas** ficam no loopback. O Nginx devolve `404` para `/metrics`; o scrape
  do Prometheus é direto em `127.0.0.1:8787`.
- **Logs** vão para o journald (systemd nativo) ou para o driver `journald` do
  Compose. Retenção e acesso são controlados no host (§5).
- **Alertas** usam `alerts.yml` (Prometheus rules). O canal de notificação é
  pendência do usuário (§7).

## 2. Contrato atual do `/metrics` (F0)

Implementado em `backend/src/metrics/registry.ts` e exposto em `backend/src/app.ts`.

| Métrica | Tipo | Labels | Uso |
|---|---|---|---|
| `mailchat_http_requests_total` | counter | `status` | taxa de 5xx e 429 |
| `mailchat_http_request_duration_ms_avg` | gauge | — | latência média (provisória) |
| `mailchat_process_uptime_seconds` | gauge | — | reinícios/uptime |

Exemplo:

```bash
curl -fsS http://127.0.0.1:8787/metrics
# mailchat_http_requests_total{status="200"} 42
# mailchat_http_request_duration_ms_avg 3.2
# mailchat_process_uptime_seconds 120.5
```

> A latência é uma **média** (não p95) e as séries só aparecem após a primeira
> requisição. Para p95, migrar para histograma em F1/F2 (não é escopo desta issue).

## 3. Métricas previstas (F1/F2) — contrato a implementar no backend

As regras em `alerts.yml` já usam os nomes abaixo. Até a instrumentação existir,
as séries ficam ausentes e os alertas não disparam (por isso há o
`MailchatMetricsMissing`).

| Métrica | Tipo | Labels | Origem |
|---|---|---|---|
| `mailchat_gmail_token_failures_total` | counter | `reason` (`invalid_grant`, `decrypt`, `refresh`) | F1 — token vault |
| `mailchat_sync_failures_total` | counter | `reason` (`429`, `5xx`, `history`, `unknown`) | F2 — worker |
| `mailchat_sync_runs_total` | counter | `status` (`completed`, `failed`, `degraded`) | F2 |
| `mailchat_gmail_api_responses_total` | counter | `status`, `endpoint` | F1/F2 — cliente Gmail |
| `mailchat_send_total` | counter | `status` | F3 |
| `mailchat_attachment_download_total` | counter | `status` | F2 |
| `mailchat_http_request_duration_seconds` | histogram | `route`, `status` | F1 — p95 |
| `pg_up` | gauge | — | postgres_exporter (opcional) |

Regras de naming: prefixo `mailchat_`, sem PII, sem `user_id`/`email`/`subject`
em labels (cardinalidade e vazamento).

## 4. Instalação (somente na janela aprovada)

```bash
# 1. Prometheus + Alertmanager + node_exporter (pacotes do distro ou binários fixados)
# 2. Regras
sudo install -d -m 0755 /etc/prometheus/rules
sudo install -m 0644 observability/alerts.yml /etc/prometheus/rules/mailchat-alerts.yml

# 3. Config de scrape (ajuste o domínio e o canal)
sudo install -m 0644 observability/prometheus.yml.example /etc/prometheus/prometheus.yml

# 4. Textfile collector
sudo install -d -m 0755 /var/lib/node_exporter/textfile
# node_exporter: --collector.textfile.directory=/var/lib/node_exporter/textfile

# 5. Validar e recarregar
promtool check rules /etc/prometheus/rules/mailchat-alerts.yml
promtool check config /etc/prometheus/prometheus.yml
sudo systemctl reload prometheus
```

**Validação offline deste repositório:** YAML é validado com parser (`python3 -c
"import yaml..."`); `promtool` não está instalado no host de preparação. O
`promtool check rules` é obrigatório antes do reload.

## 5. Logs e retenção (SR-33)

| Origem | Destino | Retenção | Acesso |
|---|---|---|---|
| backend systemd | journald (`mailchat-backend`) | 90 dias / 2 GB | `systemd-journal` (root, grupos restritos) |
| Postgres/Redis Compose | journald (`mailchat-*`) | idem | idem |
| Nginx | `/var/log/nginx/*.log` | logrotate padrão (14 dias) | root/adm |
| backup | journald (`mailchat-backup`) | 90 dias | root/adm |

Modelo de retenção do journald (`/etc/systemd/journald.conf.d/mailchat.conf`):

```ini
[Journal]
SystemMaxUse=2G
SystemMaxFileSize=64M
MaxRetentionSec=90d
Compress=yes
```

- Não logar corpo de e-mail, anexos, tokens, cookies ou `Authorization`
  (SR-13/SR-14). O logger do backend já redige chaves sensíveis.
- Acesso a logs é restrito ao operador; não há envio externo nesta fase.
- Se o disco for pequeno, reduza `SystemMaxUse` e registre a decisão.

## 6. Alertas (resumo)

| Alerta | Severidade | Condição | Ação inicial |
|---|---|---|---|
| `MailchatTargetDown` | critical | scrape do backend falha 2 min | §9.1 do runbook |
| `MailchatMetricsMissing` | warning | `/metrics` sem contador 10 min | checar instrumentação/scrape |
| `MailchatHigh5xxRate` | warning | > 5% de 5xx por 5 min | §9.2 |
| `Mailchat429Spike` | warning | > 0,2 req/s de 429 por 5 min | §9.3 |
| `MailchatGmailTokenFailures` | warning | qualquer falha em 15 min | §9.4 |
| `MailchatSyncFailures` | warning | qualquer falha em 15 min | §9.4 |
| `MailchatGmailQuotaPressure` | warning | > 10 respostas 429 do Gmail/15 min | §9.3 |
| `MailchatDiskLow` | warning | < 15% livre por 10 min | §9.5 |
| `MailchatDiskCritical` | critical | < 5% livre por 5 min | §9.5 |
| `MailchatBackupStale` | critical | último sucesso > 36 h | §9.5 |
| `MailchatBackupFailed` | critical | exit code != 0 | §9.5 |
| `MailchatBackupMetricsMissing` | warning | métrica ausente > 1 h | node_exporter/textfile |
| `MailchatTlsCertExpiring` | warning | < 14 dias (blackbox, opcional) | §8 |

Os limiares de 429 e 5xx são iniciais. Ajuste após 2 semanas de linha de base;
registre a mudança no dev-log.

## 7. Canal de alerta (pendência do usuário)

O `prometheus.yml.example` aponta para `127.0.0.1:9093` (Alertmanager), mas o
`alertmanager.yml` **não** foi criado porque o destino depende de decisão:

- e-mail (SMTP), Telegram, Slack/Discord ou webhook interno;
- plantão/on-call e horário de cobertura;
- agrupamento, inibição e silêncio.

Sem essa decisão, os alertas existem no Prometheus, mas não notificam ninguém.
Isso está registrado em `../runbook.md` §"PENDÊNCIAS DO USUÁRIO".

## 8. Segurança das métricas

- `/metrics` não é publicado pelo Nginx (`location = /metrics { return 404; }`).
- Prometheus/Alertmanager/node_exporter escutam em loopback (ou firewall restrito).
- Sem labels com e-mail, assunto, `user_id` ou token.
- Backup do próprio Prometheus (TSDB) não é crítico; retenção local de 15 dias é
  suficiente. Se habilitar retenção longa, inclua no plano de capacidade.

## 9. Capacidade e custo (estimativa)

| Item | Consumo estimado | Custo incremental |
|---|---|---|
| Prometheus local (15 d, 1 alvo + node) | < 1 GB disco, < 150 MB RAM | R$ 0 (host atual) |
| Alertmanager | < 50 MB RAM | R$ 0 |
| node_exporter | < 30 MB RAM | R$ 0 |
| Logs journald (90 d) | até 2 GB | R$ 0 (disco atual) |
| Canal externo (e-mail/Telegram) | irrelevante | R$ 0 a ~R$ 20/mês |
| Grafana Cloud/serviço gerenciado (opcional) | — | US$ 0–20/mês |

Premissas: instância única, retenção curta, sem multi-região. Aprovação de custo
é pendência explícita.
