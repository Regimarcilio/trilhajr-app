import { defineConfig } from 'drizzle-kit';

// Fallback apenas para `drizzle-kit generate` (não abre conexão). Migrations reais
// exigem DATABASE_URL apontando para o Postgres local/CI.
const databaseUrl =
  process.env.DATABASE_URL ?? 'postgres://mailchat@127.0.0.1:5434/mailchat';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
