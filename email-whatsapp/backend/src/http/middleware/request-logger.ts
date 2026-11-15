import type { MiddlewareHandler } from 'hono';
import type { Logger } from '../../logger/logger';
import type { AppEnv } from '../types';

const roundMs = (value: number): number => Math.round(value * 1000) / 1000;

/**
 * Loga uma linha por requisição. Nunca inclui body, query string ou headers —
 * apenas método, path, status, latência e request id.
 */
export function requestLogger(logger: Logger): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const startedAt = performance.now();
    let status = 500;

    try {
      await next();
      status = c.res.status;
    } finally {
      logger.info('http_request', {
        request_id: c.get('requestId'),
        method: c.req.method,
        path: c.req.path,
        status,
        duration_ms: roundMs(performance.now() - startedAt),
      });
    }
  };
}
