import { randomUUID } from 'node:crypto';
import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types';

export const REQUEST_ID_HEADER = 'X-Request-Id';

/** Aceita apenas IDs simples vindos do cliente, evitando header/log injection. */
const VALID_REQUEST_ID = /^[A-Za-z0-9._:-]{1,128}$/;

export interface RequestIdOptions {
  generator?: () => string;
}

export function requestId(options: RequestIdOptions = {}): MiddlewareHandler<AppEnv> {
  const generator = options.generator ?? randomUUID;

  return async (c, next) => {
    const incoming = c.req.header(REQUEST_ID_HEADER);
    const id = incoming !== undefined && VALID_REQUEST_ID.test(incoming) ? incoming : generator();

    c.set('requestId', id);
    c.header(REQUEST_ID_HEADER, id);
    await next();
  };
}
