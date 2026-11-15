#!/usr/bin/env node
/**
 * Rollback local das migrations F0.
 *
 * - Exige `--yes` (operação destrutiva).
 * - Bloqueia em NODE_ENV=production sem `--force-production`.
 * - Executa drizzle/rollback/0000_init.down.sql em transação.
 * - Nunca imprime a DATABASE_URL com credenciais.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const args = new Set(process.argv.slice(2));

if (!args.has('--yes')) {
  console.error('db:rollback é destrutivo. Rode novamente com --yes.');
  process.exit(2);
}

if (process.env.NODE_ENV === 'production' && !args.has('--force-production')) {
  console.error('db:rollback bloqueado em produção. Use --force-production com aprovação.');
  process.exit(2);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL não definida.');
  process.exit(2);
}

function describeTarget(url) {
  try {
    const parsed = new URL(url);
    const database = parsed.pathname.replace(/^\//, '') || '(default)';
    return `${parsed.hostname}:${parsed.port || '5432'}/${database}`;
  } catch {
    return '(URL inválida)';
  }
}

const sqlFile = fileURLToPath(new URL('../drizzle/rollback/0000_init.down.sql', import.meta.url));

const sql = postgres(databaseUrl, { max: 1 });
let exitCode = 0;

try {
  const raw = await readFile(sqlFile, 'utf8');
  const statements = raw
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  if (statements.length === 0) {
    throw new Error('nenhuma instrução encontrada no rollback');
  }

  await sql.begin(async (tx) => {
    for (const statement of statements) {
      await tx.unsafe(statement);
    }
  });

  console.log(`Rollback aplicado em ${describeTarget(databaseUrl)} (${statements.length} comandos).`);
} catch (error) {
  const message =
    error instanceof Error
      ? `${error.name}: ${error.message.replace(/postgres(ql)?:\/\/[^@\s]+@/gi, 'postgres://[REDACTED]@')}`
      : 'erro desconhecido';
  console.error(`db:rollback falhou: ${message}`);
  exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
  process.exitCode = exitCode;
}
