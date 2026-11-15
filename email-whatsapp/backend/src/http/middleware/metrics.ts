import type { MiddlewareHandler } from 'hono';
import type { Metrics } from '../../metrics/registry';
import type { AppEnv } from '../types';

const roundMs = (value: number): number => Math.round(value * 1000) / 1000;

export function metricsMiddleware(metrics: Metrics): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const startedAt = performance.now();

    try {
      await next();
      metrics.recordRequest(c.res.status, roundMs(performance.now() - startedAt));
    } catch (error) {
      metrics.recordRequest(500, roundMs(performance.now() - startedAt));
      throw error;
    }
  };
}
