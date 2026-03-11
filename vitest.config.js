/** Vitest config for unit tests. E2E tests live in e2e/ and are run by Playwright. */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**']
  }
});
