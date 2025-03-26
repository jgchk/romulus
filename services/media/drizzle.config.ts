import type { Config } from 'drizzle-kit'

export default {
  dialect: 'postgresql',
  out: './src/simple/queries/infrastructure/migrations',
  schema: ['./src/simple/queries/infrastructure/drizzle-schema.ts'],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config
