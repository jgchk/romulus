import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'
import { svelteTesting } from '@testing-library/svelte/vite'

export default defineConfig(({ mode }) => ({
  plugins: [sveltekit(), svelteTesting()],
  resolve: {
    conditions: mode === 'test' ? ['browser'] : [],
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./src/vitest-setup.ts'],
  },
}))
