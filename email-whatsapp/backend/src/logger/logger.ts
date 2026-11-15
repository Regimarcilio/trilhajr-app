export const REDACTED = '[REDACTED]';
export const CIRCULAR = '[Circular]';
export const MAX_DEPTH = '[MaxDepth]';

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

/** Chaves cujo valor nunca pode aparecer em log (tokens, segredos, sessão, cookies). */
const SENSITIVE_KEY =
  /(password|passwd|pwd|secret|token|authorization|proxy-authorization|cookie|set-cookie|api[-_]?key|private[-_]?key|ciphertext|session[-_]?id|sessionid)/i;

const POSTGRES_CREDENTIALS = /(postgres(?:ql)?:\/\/[^:\s/@]+:)([^@\s/]+)(@)/gi;
const BEARER_TOKEN = /(bearer\s+)[a-z0-9._~+/=-]+/gi;
const KEY_VALUE_SECRET =
  /\b(password|passwd|pwd|secret|token|authorization|cookie|api[-_]?key|client[-_]?secret|refresh[-_]?token|access[-_]?token)\b(\s*[=:]\s*)("[^"]*"|'[^']*'|[^\s,;]+)/gi;

/**
 * Remove segredos de textos livres (mensagens de erro, URLs com credenciais,
 * headers `Authorization`). Defesa em profundidade além da redaction por chave.
 */
export function sanitizeSecrets(input: string): string {
  return input
    .replace(POSTGRES_CREDENTIALS, `$1${REDACTED}$3`)
    .replace(BEARER_TOKEN, `$1${REDACTED}`)
    .replace(KEY_VALUE_SECRET, `$1$2${REDACTED}`);
}

/**
 * Copia recursivamente um valor aplicando redaction por nome de chave.
 * Não muta o objeto original e trata referências circulares.
 */
export function redact(value: unknown, seen: WeakSet<object> = new WeakSet(), depth = 0): unknown {
  if (typeof value === 'string') {
    return sanitizeSecrets(value);
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (depth > 8) {
    return MAX_DEPTH;
  }

  if (seen.has(value)) {
    return CIRCULAR;
  }
  seen.add(value);

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeSecrets(value.message),
      stack: value.stack === undefined ? undefined : sanitizeSecrets(value.stack),
      cause: value.cause === undefined ? undefined : redact(value.cause, seen, depth + 1),
    };
  }

  if (ArrayBuffer.isView(value)) {
    return `[binary ${value.byteLength} bytes]`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, seen, depth + 1));
  }

  if (value instanceof Map) {
    return Object.fromEntries(
      [...value.entries()].map(([key, item]) => [String(key), redact(item, seen, depth + 1)]),
    );
  }

  if (value instanceof Set) {
    return [...value.values()].map((item) => redact(item, seen, depth + 1));
  }

  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    output[key] = SENSITIVE_KEY.test(key) ? REDACTED : redact(item, seen, depth + 1);
  }
  return output;
}

export interface LoggerOptions {
  level?: LogLevel;
  base?: Record<string, unknown>;
  /** Destino das linhas JSON. Injetável para testes. */
  sink?: (line: string) => void;
  now?: () => Date;
}

export interface Logger {
  readonly level: LogLevel;
  child(bindings: Record<string, unknown>): Logger;
  fatal(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  trace(message: string, context?: Record<string, unknown>): void;
}

const defaultSink = (line: string): void => {
  process.stdout.write(`${line}\n`);
};

/**
 * Logger JSON de uma linha por evento, com redaction de campos sensíveis.
 * Formato base: `ts`, `level`, `msg` + contexto do evento.
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level ?? 'info';
  const sink = options.sink ?? defaultSink;
  const now = options.now ?? (() => new Date());

  const withBindings = (bindings: Record<string, unknown>): Logger => {
    const emit = (
      targetLevel: LogLevel,
      message: string,
      context?: Record<string, unknown>,
    ): void => {
      if (LEVEL_WEIGHT[targetLevel] < LEVEL_WEIGHT[level]) {
        return;
      }

      const bindingsRecord = redact(bindings) as Record<string, unknown>;
      const contextRecord =
        context === undefined ? {} : (redact(context) as Record<string, unknown>);
      const record: Record<string, unknown> = {
        ...bindingsRecord,
        ...contextRecord,
        ts: now().toISOString(),
        level: targetLevel,
        msg: sanitizeSecrets(message),
      };
      sink(JSON.stringify(record));
    };

    return {
      level,
      child: (extra) => withBindings({ ...bindings, ...extra }),
      fatal: (message, context) => emit('fatal', message, context),
      error: (message, context) => emit('error', message, context),
      warn: (message, context) => emit('warn', message, context),
      info: (message, context) => emit('info', message, context),
      debug: (message, context) => emit('debug', message, context),
      trace: (message, context) => emit('trace', message, context),
    };
  };

  return withBindings(options.base ?? {});
}
