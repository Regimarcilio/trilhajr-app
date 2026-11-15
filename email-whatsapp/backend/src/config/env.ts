import { z } from 'zod';

const POSTGRES_PROTOCOLS = new Set(['postgres:', 'postgresql:']);

const isPostgresUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return POSTGRES_PROTOCOLS.has(url.protocol) && url.hostname.length > 0;
  } catch {
    return false;
  }
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(8787),
  DATABASE_URL: z
    .string()
    .min(1)
    .refine(isPostgresUrl, { message: 'deve ser uma URL postgres:// ou postgresql:// válida' }),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

export interface EnvIssue {
  variable: string;
  reason: string;
}

const REASON_BY_CODE: Record<string, string> = {
  invalid_type: 'ausente ou com tipo inválido',
  invalid_value: 'valor não permitido',
  too_small: 'valor menor que o mínimo permitido',
  too_big: 'valor maior que o máximo permitido',
  invalid_format: 'formato inválido',
  custom: 'valor inválido',
};

/**
 * Erro de configuração. Expõe apenas o nome da variável e o motivo —
 * nunca o valor recebido (RNF-GM-01 / SR-39).
 */
export class EnvValidationError extends Error {
  readonly issues: readonly EnvIssue[];

  constructor(issues: readonly EnvIssue[]) {
    const summary = issues.map((issue) => `${issue.variable} (${issue.reason})`).join('; ');
    super(`Configuração de ambiente inválida: ${summary}. Corrija o .env e reinicie.`);
    this.name = 'EnvValidationError';
    this.issues = issues;
  }
}

/**
 * Valida e normaliza o ambiente. Falha rápido com `EnvValidationError`.
 * Aceita uma fonte injetável para testes (sem tocar em `process.env`).
 */
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => ({
      variable: issue.path.length > 0 ? issue.path.join('.') : '(root)',
      reason: REASON_BY_CODE[issue.code] ?? 'configuração inválida',
    }));
    throw new EnvValidationError(issues);
  }

  return parsed.data;
}
