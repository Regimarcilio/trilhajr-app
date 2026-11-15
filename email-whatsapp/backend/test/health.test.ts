import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { AppError } from '../src/http/errors';
import { createErrorHandler } from '../src/http/middleware/error-handler';
import { requestId } from '../src/http/middleware/request-id';
import type { AppEnv } from '../src/http/types';
import { Hono } from 'hono';
import { asRecord, captureLogger, silentLogger, testEnv } from './helpers';

const config = testEnv();

function buildApp(generatedId = 'generated-request-id') {
  return createApp({
    config,
    logger: silentLogger(),
    requestIdGenerator: () => generatedId,
  });
}

describe('GET /health', () => {
  it('responde 200 com {"status":"ok"} e X-Request-Id', async () => {
    const app = buildApp();
    const response = await app.request('/health');

    expect(response.status).toBe(200);
    expect(response.headers.get('x-request-id')).toBe('generated-request-id');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('ecoa um X-Request-Id válido enviado pelo cliente', async () => {
    const app = buildApp();
    const response = await app.request('/health', {
      headers: { 'X-Request-Id': 'client-id-123' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('x-request-id')).toBe('client-id-123');
  });

  it('substitui X-Request-Id inválido (header injection/valor fora do padrão)', async () => {
    const app = buildApp('replaced-request-id');
    const response = await app.request('/health', {
      headers: { 'X-Request-Id': 'bad id!<script>' },
    });

    expect(response.headers.get('x-request-id')).toBe('replaced-request-id');
  });
});

describe('envelope de erro', () => {
  it('retorna 404 padronizado para rota inexistente', async () => {
    const app = buildApp('nf-id');
    const response = await app.request('/nao-existe');
    const body = asRecord(await response.json());
    const error = asRecord(body.error);

    expect(response.status).toBe(404);
    expect(response.headers.get('x-request-id')).toBe('nf-id');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Recurso não encontrado.');
    expect(error.details).toEqual([]);
    expect(error.requestId).toBe('nf-id');
  });

  it('mapeia AppError para status/código/details', async () => {
    const app = new Hono<AppEnv>();
    app.use('*', requestId({ generator: () => 'app-error-id' }));
    app.get('/invalid', () => {
      throw new AppError(422, 'VALIDATION_ERROR', 'Dados inválidos.', [
        { field: 'email', reason: 'obrigatório' },
      ]);
    });
    app.onError(createErrorHandler(silentLogger()));

    const response = await app.request('/invalid');
    const body = asRecord(await response.json());
    const error = asRecord(body.error);

    expect(response.status).toBe(422);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.requestId).toBe('app-error-id');
    expect(error.details).toEqual([{ field: 'email', reason: 'obrigatório' }]);
  });

  it('não vaza stack/mensagem interna em erro inesperado e sanitiza o log', async () => {
    const { logger, lines } = captureLogger();
    const app = new Hono<AppEnv>();
    app.use('*', requestId({ generator: () => 'boom-id' }));
    app.get('/boom', () => {
      throw new Error('falha interna token=super-secret-token');
    });
    app.onError(createErrorHandler(logger));

    const response = await app.request('/boom');
    const rawBody = await response.text();
    const body = asRecord(JSON.parse(rawBody));
    const error = asRecord(body.error);

    expect(response.status).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.message).toBe('Erro interno.');
    expect(error.requestId).toBe('boom-id');
    expect(rawBody).not.toContain('super-secret-token');
    expect(rawBody).not.toContain('at ');

    expect(lines).toHaveLength(1);
    expect(lines[0]).not.toContain('super-secret-token');
    expect(lines[0]).toContain('[REDACTED]');
  });
});
