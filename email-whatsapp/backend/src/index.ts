import { serve } from '@hono/node-server';
import { createApp } from './app';
import { EnvValidationError, loadEnv } from './config/env';
import { createLogger } from './logger/logger';

const SHUTDOWN_TIMEOUT_MS = 10_000;

function start(): void {
  let config;
  try {
    config = loadEnv(process.env);
  } catch (error) {
    if (error instanceof EnvValidationError) {
      // JSON em stderr, somente nomes de variáveis e motivos — nunca valores.
      process.stderr.write(
        `${JSON.stringify({
          ts: new Date().toISOString(),
          level: 'fatal',
          msg: 'invalid_environment',
          issues: error.issues,
        })}\n`,
      );
      process.exitCode = 1;
      return;
    }
    throw error;
  }

  const logger = createLogger({ level: config.LOG_LEVEL });
  const app = createApp({ config, logger });

  const server = serve(
    {
      fetch: app.fetch,
      hostname: config.HOST,
      port: config.PORT,
    },
    (info) => {
      logger.info('server_started', {
        host: config.HOST,
        port: info.port,
        env: config.NODE_ENV,
      });
    },
  );

  let shuttingDown = false;
  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    logger.info('shutdown_started', { signal });

    const forceExit = setTimeout(() => {
      logger.error('shutdown_timeout', { timeout_ms: SHUTDOWN_TIMEOUT_MS });
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    server.close(() => {
      clearTimeout(forceExit);
      logger.info('shutdown_complete');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
