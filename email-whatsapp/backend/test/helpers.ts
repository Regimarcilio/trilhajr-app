import { loadEnv, type Env } from '../src/config/env';
import { createLogger, type Logger } from '../src/logger/logger';

const DEFAULT_TEST_ENV = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgres://mailchat@127.0.0.1:5434/mailchat_test',
  LOG_LEVEL: 'fatal',
} as const;

export function testEnv(overrides: Record<string, string | undefined> = {}): Env {
  return loadEnv({ ...DEFAULT_TEST_ENV, ...overrides });
}

export function silentLogger(): Logger {
  return createLogger({ level: 'fatal', sink: () => {} });
}

export interface CapturedLogger {
  logger: Logger;
  lines: string[];
}

export function captureLogger(level: Logger['level'] = 'trace'): CapturedLogger {
  const lines: string[] = [];
  const logger = createLogger({
    level,
    sink: (line) => {
      lines.push(line);
    },
  });
  return { logger, lines };
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('valor não é um objeto');
  }
  return value as Record<string, unknown>;
}
