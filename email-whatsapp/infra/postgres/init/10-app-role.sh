#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# MailChat — bootstrap do papel de aplicação no Postgres
#
# Executado UMA VEZ pelo entrypoint oficial do Postgres quando o volume de
# dados está vazio (/docker-entrypoint-initdb.d). Se o volume já existir, rode
# o SQL equivalente manualmente (ver infra/runbook.md §5.2).
#
# Princípios:
#   - `mailchat_owner` (POSTGRES_USER) permanece owner/DDL e é usado só em
#     migrations administrativas.
#   - `mailchat_app` é LOGIN sem superuser/createdb/createrole/bypassrls e só
#     recebe DML (SELECT/INSERT/UPDATE/DELETE) nas tabelas de `public`.
#   - A senha chega por variável de ambiente do container (nunca no arquivo).
#   - Nenhuma credencial é impressa.
# ─────────────────────────────────────────────────────────────────────────────
set -eu

: "${POSTGRES_USER:?POSTGRES_USER ausente}"
: "${POSTGRES_DB:?POSTGRES_DB ausente}"
: "${MAILCHAT_APP_PASSWORD:?MAILCHAT_APP_PASSWORD ausente}"
MAILCHAT_APP_USER="${MAILCHAT_APP_USER:-mailchat_app}"

psql -v ON_ERROR_STOP=1 \
     --username "$POSTGRES_USER" \
     --dbname "$POSTGRES_DB" \
     -v app_user="$MAILCHAT_APP_USER" \
     -v app_password="$MAILCHAT_APP_PASSWORD" <<'SQL'
SELECT format(
  'CREATE ROLE %I LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 20',
  :'app_user', :'app_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_user')
\gexec

ALTER ROLE :"app_user" SET statement_timeout = '60s';
ALTER ROLE :"app_user" SET idle_in_transaction_session_timeout = '60s';

REVOKE ALL ON SCHEMA public FROM :"app_user";
GRANT CONNECT ON DATABASE :"DBNAME" TO :"app_user";
GRANT USAGE ON SCHEMA public TO :"app_user";

-- Objetos já existentes (idempotente).
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO :"app_user";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :"app_user";
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO :"app_user";

-- Objetos criados depois pelas migrations do owner.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO :"app_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO :"app_user";
SQL

echo "mailchat: papel ${MAILCHAT_APP_USER} pronto (DML em public, sem DDL)."
