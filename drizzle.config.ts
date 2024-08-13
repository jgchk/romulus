import 'dotenv/config'

import type { Config } from 'drizzle-kit'

export default {
  dialect: 'postgresql',
  out: './src/lib/server/db/migrations',
  schema: './src/lib/server/db/schema/*',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config
