import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

export default defineConfig({
  webServer:
    process.env.NODE_ENV === 'development'
      ? { command: 'npm run dev', port: 5173 }
      : {
          command: 'npm run build && npm run preview',
          port: 4173,
        },
  testDir: 'tests',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
        },
      },
    },
  ],
})
