export interface Metrics {
  recordRequest(status: number, durationMs: number): void;
  render(): string;
}

export interface MetricsOptions {
  /** Epoch em ms; injetável para testes determinísticos. */
  startedAt?: number;
  now?: () => number;
}

const round = (value: number): number => Math.round(value * 1000) / 1000;

/**
 * Registro mínimo de métricas em formato Prometheus (text exposition).
 * Sem dependências: suficiente para a fundação (E0.5).
 */
export function createMetrics(options: MetricsOptions = {}): Metrics {
  const startedAt = options.startedAt ?? Date.now();
  const now = options.now ?? (() => Date.now());

  const requestsByStatus = new Map<number, number>();
  let durationSumMs = 0;
  let requestCount = 0;

  return {
    recordRequest(status, durationMs) {
      requestCount += 1;
      durationSumMs += durationMs;
      requestsByStatus.set(status, (requestsByStatus.get(status) ?? 0) + 1);
    },

    render() {
      const lines: string[] = [
        '# HELP mailchat_http_requests_total Total de requisições HTTP por status.',
        '# TYPE mailchat_http_requests_total counter',
      ];

      for (const status of [...requestsByStatus.keys()].sort((a, b) => a - b)) {
        lines.push(
          `mailchat_http_requests_total{status="${status}"} ${requestsByStatus.get(status) ?? 0}`,
        );
      }

      lines.push(
        '# HELP mailchat_http_request_duration_ms_avg Duração média das requisições em ms.',
        '# TYPE mailchat_http_request_duration_ms_avg gauge',
        `mailchat_http_request_duration_ms_avg ${
          requestCount === 0 ? 0 : round(durationSumMs / requestCount)
        }`,
        '# HELP mailchat_process_uptime_seconds Tempo desde o start do processo.',
        '# TYPE mailchat_process_uptime_seconds gauge',
        `mailchat_process_uptime_seconds ${round((now() - startedAt) / 1000)}`,
        '',
      );

      return lines.join('\n');
    },
  };
}
