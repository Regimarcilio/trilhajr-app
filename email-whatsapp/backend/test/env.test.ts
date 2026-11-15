import { describe, expect, it } from 'vitest';
import { EnvValidationError, loadEnv } from '../src/config/env';

function captureError(fn: () => unknown): EnvValidationError {
  try {
    fn();
  } catch (error) {
    if (error instanceof EnvValidationError) {
      return error;
    }
    throw error;
  }
  throw new Error('esperava EnvValidationError');
}

const validEnv = {
  DATABASE_URL: 'postgres://mailchat@127.0.0.1:5433/mailchat',
};

describe('validação de ambiente', () => {
  it('aplica defaults seguros quando só DATABASE_URL é informada', () => {
    const env = loadEnv(validEnv);

    expect(env.NODE_ENV).toBe('development');
    expect(env.HOST).toBe('0.0.0.0');
    expect(env.PORT).toBe(8787);
    expect(env.LOG_LEVEL).toBe('info');
  });

  it('converte PORT numérica e aceita LOG_LEVEL válido', () => {
    const env = loadEnv({ ...validEnv, PORT: '9091', LOG_LEVEL: 'debug' });

    expect(env.PORT).toBe(9091);
    expect(env.LOG_LEVEL).toBe('debug');
  });

  it('falha sem DATABASE_URL e informa apenas o nome da variável', () => {
    const error = captureError(() => loadEnv({ NODE_ENV: 'production' }));

    expect(error.message).toContain('DATABASE_URL');
    expect(error.issues).toEqual([
      { variable: 'DATABASE_URL', reason: 'ausente ou com tipo inválido' },
    ]);
  });

  it('não expõe o valor de uma DATABASE_URL inválida', () => {
    const secret = 'senha-super-secreta';
    const error = captureError(() =>
      loadEnv({ DATABASE_URL: `mysql://usuario:${secret}@host/db` }),
    );

    expect(error.message).not.toContain(secret);
    expect(error.message).not.toContain('mysql://');
    expect(error.issues[0]?.variable).toBe('DATABASE_URL');
  });

  it('não expõe valores inválidos de PORT e NODE_ENV', () => {
    const error = captureError(() =>
      loadEnv({ ...validEnv, PORT: 'porta-secreta', NODE_ENV: 'staging-secreto' }),
    );

    expect(error.message).not.toContain('porta-secreta');
    expect(error.message).not.toContain('staging-secreto');
    expect(error.issues.map((issue) => issue.variable)).toEqual(
      expect.arrayContaining(['PORT', 'NODE_ENV']),
    );
  });

  it('não muta o objeto de origem', () => {
    const source = { ...validEnv, PORT: '8788' };
    const snapshot = { ...source };

    loadEnv(source);

    expect(source).toEqual(snapshot);
  });
});
