import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    css: true,
    include: ['./src/**/*.test.ts'],
    setupFiles: ['./src/vitest-setup.ts'],
    fileParallelism: false,
    testTimeout: 10000, // FIXME: This is a patch for long-running tests that rely on PGlite. We should remove reliance on PGlite so we can remove this.
  },
})
