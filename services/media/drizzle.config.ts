import type { Config } from 'drizzle-kit'

export default {
  dialect: 'postgresql',
  out: './src/common/infrastructure/drizzle/migrations',
  schema: [
    './src/queries/infrastructure/drizzle-schema.ts',
    './src/common/infrastructure/drizzle/event-store-schema.ts',
  ],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config
