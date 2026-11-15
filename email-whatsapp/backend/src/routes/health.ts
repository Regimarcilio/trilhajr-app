import { Hono } from 'hono';
import type { AppEnv } from '../http/types';

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get('/health', (c) => {
  c.header('Cache-Control', 'no-store');
  return c.json({ status: 'ok' as const });
});
