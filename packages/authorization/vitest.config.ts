import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    css: true,
    include: ['./src/**/*.test.ts'],
  },
})
