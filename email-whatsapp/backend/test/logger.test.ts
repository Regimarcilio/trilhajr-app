import { describe, expect, it } from 'vitest';
import {
  CIRCULAR,
  REDACTED,
  createLogger,
  redact,
  sanitizeSecrets,
} from '../src/logger/logger';
import { asRecord, captureLogger } from './helpers';

describe('logger JSON + redaction', () => {
  it('redige chaves sensíveis aninhadas e preserva campos seguros', () => {
    const { logger, lines } = captureLogger();

    logger.info('login_attempt', {
      request_id: 'req-1',
      user: {
        email: 'pessoa@example.com',
        password: 'hunter2',
        nested: { authorization: 'Bearer abc.def', token: 'tok_123' },
      },
      refresh_token: 'refresh_123',
      client_secret: 'segredo',
      token_hash: 'hash',
      session_id: 'sess-1',
      error_code: 'INVALID_GRANT',
    });

    expect(lines).toHaveLength(1);
    const record = asRecord(JSON.parse(lines[0] ?? '{}'));
    const user = asRecord(record.user);
    const nested = asRecord(user.nested);

    expect(record.level).toBe('info');
    expect(record.msg).toBe('login_attempt');
    expect(typeof record.ts).toBe('string');
    expect(record.request_id).toBe('req-1');
    expect(user.email).toBe('pessoa@example.com');
    expect(user.password).toBe(REDACTED);
    expect(nested.authorization).toBe(REDACTED);
    expect(nested.token).toBe(REDACTED);
    expect(record.refresh_token).toBe(REDACTED);
    expect(record.client_secret).toBe(REDACTED);
    expect(record.token_hash).toBe(REDACTED);
    expect(record.session_id).toBe(REDACTED);
    // Códigos de erro são necessários para diagnóstico e não são segredos.
    expect(record.error_code).toBe('INVALID_GRANT');
  });

  it('sanitiza Authorization, credenciais de URL e key=value em textos', () => {
    const input =
      'call falhou Authorization: Bearer abc.def.ghi password=hunter2 postgres://user:s3cr3t@db:5432/x';
    const output = sanitizeSecrets(input);

    expect(output).not.toContain('abc.def.ghi');
    expect(output).not.toContain('hunter2');
    expect(output).not.toContain('s3cr3t');
    expect(output).toContain(REDACTED);
  });

  it('serializa Error sem vazar segredos da mensagem', () => {
    const { logger, lines } = captureLogger();

    logger.error('unhandled', {
      error: new Error('Authorization: Bearer abc.def token=super-secret'),
    });

    const line = lines[0] ?? '';
    expect(line).not.toContain('abc.def');
    expect(line).not.toContain('super-secret');
    expect(line).toContain('[REDACTED]');
  });

  it('trata referência circular sem lançar', () => {
    const circular: Record<string, unknown> = { name: 'x' };
    circular.self = circular;

    const output = asRecord(redact(circular));

    expect(output.name).toBe('x');
    expect(output.self).toBe(CIRCULAR);
  });

  it('respeita o nível mínimo configurado', () => {
    const { logger, lines } = captureLogger('info');

    logger.debug('nao_deve_sair');
    logger.info('deve_sair');

    expect(lines).toHaveLength(1);
    expect(asRecord(JSON.parse(lines[0] ?? '{}')).msg).toBe('deve_sair');
  });

  it('herda bindings do child', () => {
    const { logger, lines } = captureLogger();
    const child = logger.child({ request_id: 'req-child' });

    child.info('evento');

    expect(asRecord(JSON.parse(lines[0] ?? '{}')).request_id).toBe('req-child');
  });

  it('não muta o objeto original durante a redaction', () => {
    const original = { password: 'hunter2', nested: { token: 'tok' } };

    redact(original);

    expect(original.password).toBe('hunter2');
    expect(original.nested.token).toBe('tok');
  });

  it('mantém uma linha JSON por evento', () => {
    const logger = createLogger({ level: 'info', sink: (line) => {
      expect(line.includes('\n')).toBe(false);
      JSON.parse(line);
    } });

    logger.info('a');
    logger.warn('b');
  });
});
