import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  webServer:
    process.env.NODE_ENV === 'development'
      ? { command: 'npm run dev', port: 5173 }
      : {
          command: 'npm run build && npm run preview',
          port: 4173,
        },
  testDir: path.join(__dirname, 'tests'),
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
