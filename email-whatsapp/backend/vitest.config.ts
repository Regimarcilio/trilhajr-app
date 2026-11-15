import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Testes de integração dependem de Postgres e se auto-ignoram sem TEST_DATABASE_URL.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
