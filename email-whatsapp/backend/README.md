# MailChat backend — fundação (F0)

Backend Node 22 + TypeScript strict + Hono. Esta fase entrega **apenas fundação**:
healthcheck, validação de ambiente, envelope de erro, logger com redaction,
Postgres/Drizzle e CI. Nenhum fluxo de Gmail/OAuth2/sync/envio existe aqui.

## Endpoints

| Método | Rota | Resposta |
|---|---|---|
| GET | `/health` | `200 {"status":"ok"}` + header `X-Request-Id` |
| GET | `/metrics` | métricas mínimas em formato Prometheus |

Todo erro segue o envelope do SRS:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Recurso não encontrado.",
    "details": [],
    "requestId": "01JCV8Z3K9Q2M4T7"
  }
}
```

`X-Request-Id` é reutilizado quando o cliente envia um valor válido
(`[A-Za-z0-9._:-]{1,128}`); caso contrário, é gerado pelo servidor.

## Requisitos

- Node >= 22.18
- Docker (para o Postgres local)

## Rodando localmente

```bash
cd email-whatsapp/backend
cp .env.example .env
npm ci

# Postgres local (trust auth, bind em 127.0.0.1:5434)
docker compose up -d

# aplica as migrations
npm run db:migrate

npm run dev
curl -i http://127.0.0.1:8787/health
```

Porta padrão: **8787** (não conflita com o frontend/`mailchat.service` na 3100).

### Migration e rollback

```bash
npm run db:generate   # gera SQL versionado em drizzle/
npm run db:migrate    # aplica migrations pendentes
npm run db:rollback -- --yes   # destrutivo: derruba as tabelas F0 (somente dev)
```

O rollback recusa `NODE_ENV=production` sem `--force-production`.

## Scripts

| Script | Função |
|---|---|
| `npm run dev` | `tsx watch` em `src/index.ts` |
| `npm run build` | bundle ESM em `dist/` (tsup) |
| `npm start` | executa `dist/index.js` |
| `npm run typecheck` | `tsc --noEmit` (src + testes) |
| `npm run lint` | ESLint 10 flat config |
| `npm test` | Vitest (unitários; **não exige Postgres**) |
| `npm run test:integration` | Vitest contra `TEST_DATABASE_URL` |
| `npm run db:*` | Drizzle Kit + rollback |

### Teste de integração (opcional)

```bash
docker compose up -d
docker compose exec postgres createdb -U mailchat mailchat_test
TEST_DATABASE_URL=postgres://mailchat@127.0.0.1:5434/mailchat_test \
  npm run test:integration
```

O teste de integração aplica as migrations no banco de teste antes de validar
as tabelas, então não é preciso rodar `db:migrate` antes.

O arquivo `test/integration/db.integration.test.ts` se auto-ignora sem
`TEST_DATABASE_URL`.

## Configuração

Validada com Zod no boot (`src/config/env.ts`). Se faltar variável obrigatória ou
o formato for inválido, o processo falha com exit code 1 e imprime apenas
**nome da variável + motivo** — nunca o valor (SR-39 / RNF-GM-01).

| Variável | Obrigatória | Default |
|---|---|---|
| `DATABASE_URL` | sim | — |
| `NODE_ENV` | não | `development` |
| `HOST` | não | `0.0.0.0` |
| `PORT` | não | `8787` |
| `LOG_LEVEL` | não | `info` |

## Estrutura

```text
src/
  app.ts                    # composição do app Hono (testável)
  index.ts                  # boot, validação de env, shutdown
  config/env.ts             # schema Zod + erro sem valores
  logger/logger.ts          # JSON + redaction + sanitização de textos
  http/errors.ts            # AppError + envelope
  http/middleware/          # request-id, erro, log, métricas
  metrics/registry.ts       # contador Prometheus mínimo
  routes/health.ts          # GET /health
  db/schema.ts              # users, sessions, connected_accounts, oauth_tokens, sync_state
  db/client.ts              # pool lazy (não conecta em teste unitário)
drizzle/                    # SQL gerado + rollback
test/                       # Vitest (unitários + integração condicional)
```

## Segurança nesta fase

- Nenhum segredo real no repositório; `.env` ignorado; `.env.example` só placeholders.
- Logger redige `password`, `secret`, `token`, `authorization`, `cookie`, `session_id`,
  `ciphertext` e sanitiza URLs/bearer em mensagens de erro.
- `oauth_tokens` só admite ciphertext/IV/tag — não há coluna de token em claro.
- `npm audit` e `gitleaks` rodam no CI (`.github/workflows/mailchat-ci.yml`).
