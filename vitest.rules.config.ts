import { defineConfig } from 'vitest/config';

// Separate config from vite.config.ts on purpose: these tests need a running
// Firestore Emulator (see package.json "test:rules") and a Node environment,
// while the main `npm test` suite runs in jsdom with no emulator dependency.
// Keeping them apart means a missing/unstarted emulator never breaks `npm test`.
export default defineConfig({
  test: {
    include: ['src/test/firestore.rules.test.ts'],
    environment: 'node',
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
