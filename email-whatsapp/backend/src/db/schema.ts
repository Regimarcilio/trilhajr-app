import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Schema base F0. IDs são UUIDv7 (nativo no Postgres 18).
 * Nenhuma coluna de token em claro: `oauth_tokens` guarda apenas ciphertext/IV/tag.
 */
const id = () => uuid('id').primaryKey().default(sql`uuidv7()`);
const createdAt = () =>
  timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow();

export const users = pgTable(
  'users',
  {
    id: id(),
    email: text('email').notNull().unique(),
    name: text('name'),
    status: text('status').notNull().default('active'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check('users_status_check', sql`${table.status} in ('active', 'disabled', 'deleted')`),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'date' }),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: createdAt(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
);

export const connectedAccounts = pgTable(
  'connected_accounts',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull().default('google'),
    providerAccountId: text('provider_account_id').notNull(),
    email: text('email').notNull(),
    scopes: text('scopes').array().notNull().default(sql`ARRAY[]::text[]`),
    status: text('status').notNull().default('active'),
    connectedAt: timestamp('connected_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    lastSyncAt: timestamp('last_sync_at', { withTimezone: true, mode: 'date' }),
    lastErrorCode: text('last_error_code'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('connected_accounts_user_provider_account_unique').on(
      table.userId,
      table.providerAccountId,
    ),
    index('connected_accounts_user_id_idx').on(table.userId),
    check(
      'connected_accounts_status_check',
      sql`${table.status} in ('active', 'revoked', 'degraded', 'error')`,
    ),
  ],
);

export const oauthTokens = pgTable(
  'oauth_tokens',
  {
    id: id(),
    accountId: uuid('account_id')
      .notNull()
      .unique()
      .references(() => connectedAccounts.id, { onDelete: 'cascade' }),
    refreshCiphertext: text('refresh_ciphertext').notNull(),
    refreshIv: text('refresh_iv').notNull(),
    refreshTag: text('refresh_tag').notNull(),
    keyVersion: integer('key_version').notNull().default(1),
    accessCiphertext: text('access_ciphertext'),
    accessIv: text('access_iv'),
    accessTag: text('access_tag'),
    accessExpiresAt: timestamp('access_expires_at', { withTimezone: true, mode: 'date' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [check('oauth_tokens_key_version_check', sql`${table.keyVersion} > 0`)],
);

export const syncState = pgTable(
  'sync_state',
  {
    id: id(),
    accountId: uuid('account_id')
      .notNull()
      .unique()
      .references(() => connectedAccounts.id, { onDelete: 'cascade' }),
    lastHistoryId: text('last_history_id'),
    cursorPageToken: text('cursor_page_token'),
    lastFullSyncAt: timestamp('last_full_sync_at', { withTimezone: true, mode: 'date' }),
    status: text('status').notNull().default('idle'),
    attempts: integer('attempts').notNull().default(0),
    lastErrorCode: text('last_error_code'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check(
      'sync_state_status_check',
      sql`${table.status} in ('idle', 'running', 'degraded', 'error')`,
    ),
    check('sync_state_attempts_check', sql`${table.attempts} >= 0`),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type ConnectedAccount = typeof connectedAccounts.$inferSelect;
export type OAuthToken = typeof oauthTokens.$inferSelect;
export type SyncState = typeof syncState.$inferSelect;
