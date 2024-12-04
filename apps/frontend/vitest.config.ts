import { sveltekit } from '@sveltejs/kit/vite'
import { svelteTesting } from '@testing-library/svelte/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  plugins: [sveltekit(), svelteTesting()],
  resolve: {
    conditions: mode === 'test' ? ['browser'] : [],
  },
  test: {
    css: true,
    include: ['src/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./src/vitest-setup.ts'],
  },
}))
