import type { Context, ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { Logger } from '../../logger/logger';
import { AppError, buildErrorEnvelope, codeForStatus, ERROR_CODES } from '../errors';
import type { AppEnv } from '../types';

function requestIdOf(c: Context<AppEnv>): string {
  const id = c.get('requestId');
  return typeof id === 'string' && id.length > 0 ? id : 'unknown';
}

export function createErrorHandler(logger: Logger): ErrorHandler<AppEnv> {
  return (err, c) => {
    const requestId = requestIdOf(c);

    if (err instanceof AppError) {
      if (err.status >= 500) {
        logger.error('request_failed', { request_id: requestId, code: err.code, error: err });
      } else {
        logger.debug('request_rejected', { request_id: requestId, code: err.code });
      }

      const envelope = buildErrorEnvelope(err.code, err.message, requestId, err.details);
      return c.json(envelope, err.status);
    }

    if (err instanceof HTTPException) {
      const status = err.status as ContentfulStatusCode;
      const safeMessage = status >= 500 ? 'Erro interno.' : err.message;

      if (status >= 500) {
        logger.error('http_exception', { request_id: requestId, status, error: err });
      }

      return c.json(
        buildErrorEnvelope(codeForStatus(status), safeMessage, requestId),
        status,
      );
    }

    logger.error('unhandled_error', { request_id: requestId, error: err });
    return c.json(
      buildErrorEnvelope(ERROR_CODES.INTERNAL_ERROR, 'Erro interno.', requestId),
      500,
    );
  };
}

export const notFoundHandler: NotFoundHandler<AppEnv> = (c) =>
  c.json(
    buildErrorEnvelope(ERROR_CODES.NOT_FOUND, 'Recurso não encontrado.', requestIdOf(c)),
    404,
  );
