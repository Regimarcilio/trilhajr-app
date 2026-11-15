import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export interface CreateDbOptions {
  /** Máximo de conexões no pool. */
  max?: number;
  idleTimeoutSeconds?: number;
  connectTimeoutSeconds?: number;
}

/**
 * Cria o pool e o cliente Drizzle de forma lazy: nada conecta até a primeira query.
 * Testes unitários não precisam de Postgres.
 */
export function createDb(databaseUrl: string, options: CreateDbOptions = {}) {
  const sql = postgres(databaseUrl, {
    max: options.max ?? 10,
    idle_timeout: options.idleTimeoutSeconds ?? 20,
    connect_timeout: options.connectTimeoutSeconds ?? 10,
  });

  const db = drizzle(sql, { schema });

  return {
    db,
    sql,
    close: async (): Promise<void> => {
      await sql.end({ timeout: 5 });
    },
  };
}

export type Database = ReturnType<typeof createDb>['db'];
export type DatabaseSql = ReturnType<typeof createDb>['sql'];
export type DatabaseHandle = ReturnType<typeof createDb>;
