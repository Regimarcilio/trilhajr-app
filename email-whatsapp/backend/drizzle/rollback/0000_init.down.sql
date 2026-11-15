-- Rollback da migration inicial F0 (0000).
-- Uso local/dev. NÃO executar em produção sem aprovação explícita.
-- Ordem reversa das FKs para permitir DROP.

DROP TABLE IF EXISTS "sync_state" CASCADE;
DROP TABLE IF EXISTS "oauth_tokens" CASCADE;
DROP TABLE IF EXISTS "connected_accounts" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Permite reaplicar as migrations do zero após o rollback.
DELETE FROM "drizzle"."__drizzle_migrations";
