import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['./src/**/*.test.ts'],
    setupFiles: ['dotenv/config', 'src/vitest-setup.ts'],
  },
})
