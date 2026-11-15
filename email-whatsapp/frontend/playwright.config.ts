import { defineConfig, devices } from '@playwright/test';

const PORTA_E2E = 3100;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORTA_E2E}`;
// Quando E2E_BASE_URL é informado, a suíte aponta para um ambiente já em execução
// (local ou remoto) e o Playwright não sobe um servidor próprio.
const usarServidorLocal = !process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: usarServidorLocal
    ? {
        // Build + start de produção: evita o primeiro carregamento lento do modo dev
        // e a reescrita do next-env.d.ts entre as execuções da suíte.
        command: `npx next build && npx next start -p ${PORTA_E2E}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
