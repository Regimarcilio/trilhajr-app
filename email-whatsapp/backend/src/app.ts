import { Hono } from 'hono';
import type { Env } from './config/env';
import { createErrorHandler, notFoundHandler } from './http/middleware/error-handler';
import { metricsMiddleware } from './http/middleware/metrics';
import { requestId } from './http/middleware/request-id';
import { requestLogger } from './http/middleware/request-logger';
import type { AppEnv } from './http/types';
import { createLogger, type Logger } from './logger/logger';
import { createMetrics } from './metrics/registry';
import { healthRoutes } from './routes/health';

export interface CreateAppOptions {
  config: Env;
  logger?: Logger;
  /** Injetável para testes; em produção usa `crypto.randomUUID()`. */
  requestIdGenerator?: () => string;
}

export function createApp(options: CreateAppOptions): Hono<AppEnv> {
  const logger = options.logger ?? createLogger({ level: options.config.LOG_LEVEL });
  const metrics = createMetrics();
  const app = new Hono<AppEnv>();

  app.use('*', requestId({ generator: options.requestIdGenerator }));
  app.use('*', requestLogger(logger));
  app.use('*', metricsMiddleware(metrics));

  app.route('/', healthRoutes);

  app.get('/metrics', (c) =>
    c.text(metrics.render(), 200, {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-store',
    }),
  );

  app.notFound(notFoundHandler);
  app.onError(createErrorHandler(logger));

  return app;
}
