import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDb, type DatabaseHandle } from '../../src/db/client';

/**
 * Integração real com Postgres. Só executa quando TEST_DATABASE_URL está definida:
 * os testes unitários (`npm test`) não exigem banco.
 */
const databaseUrl = process.env.TEST_DATABASE_URL;
const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));
const describeDb = databaseUrl === undefined ? describe.skip : describe;

describeDb('migrations F0 (Postgres real)', () => {
  let handle: DatabaseHandle | undefined;

  beforeAll(async () => {
    if (databaseUrl === undefined) {
      return;
    }
    handle = createDb(databaseUrl, { max: 1 });
    await migrate(handle.db, { migrationsFolder });
  });

  afterAll(async () => {
    await handle?.close();
  });

  it('cria as cinco tabelas base', async () => {
    if (handle === undefined) {
      throw new Error('handle ausente');
    }

    const rows = await handle.sql<{ table_name: string }[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `;
    const names = rows.map((row) => row.table_name);

    expect(names).toEqual(
      expect.arrayContaining([
        'users',
        'sessions',
        'connected_accounts',
        'oauth_tokens',
        'sync_state',
      ]),
    );
  });

  it('usa uuidv7() como default dos IDs', async () => {
    if (handle === undefined) {
      throw new Error('handle ausente');
    }

    const rows = await handle.sql<{ column_default: string | null }[]>`
      select column_default
      from information_schema.columns
      where table_schema = 'public' and table_name = 'users' and column_name = 'id'
    `;

    expect(rows[0]?.column_default ?? '').toContain('uuidv7');
  });
});
