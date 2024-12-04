import 'dotenv/config'

import type { Config } from 'drizzle-kit'

export default {
  dialect: 'postgresql',
  out: './src/lib/server/db/migrations',
  schema: [
    './src/lib/server/db/schema/*',
    './src/lib/server/features/media/queries/infrastructure/drizzle-schema.ts',
  ],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config
