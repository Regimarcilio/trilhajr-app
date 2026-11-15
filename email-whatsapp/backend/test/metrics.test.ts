import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { silentLogger, testEnv } from './helpers';

const config = testEnv();

describe('GET /metrics', () => {
  it('expõe contadores Prometheus e uptime', async () => {
    const app = createApp({ config, logger: silentLogger() });

    await app.request('/health');
    const response = await app.request('/metrics');
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(body).toContain('mailchat_http_requests_total{status="200"} 1');
    expect(body).toContain('mailchat_http_request_duration_ms_avg');
    expect(body).toContain('mailchat_process_uptime_seconds');
  });
});
