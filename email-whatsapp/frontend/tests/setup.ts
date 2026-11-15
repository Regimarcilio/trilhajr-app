import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // jsdom setup
});
afterEach(() => {
  cleanup();
});
afterAll(() => {
  // teardown
});
