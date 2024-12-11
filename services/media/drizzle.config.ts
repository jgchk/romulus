import type { Config } from 'drizzle-kit'

export default {
  dialect: 'postgresql',
  out: './src/queries/infrastructure/migrations',
  schema: ['./src/queries/infrastructure/drizzle-schema.ts'],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config
