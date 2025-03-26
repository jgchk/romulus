import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    css: true,
    include: ['./src/**/*.test.ts'],
    setupFiles: ['./src/vitest-setup.ts'],
    testTimeout: 15000, // FIXME: We have slow tests due to using PGlite. Let's refactor to not rely on PGlite instead of increasing the timeout.
  },
})
