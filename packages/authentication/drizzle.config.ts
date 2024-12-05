import type { Config } from 'drizzle-kit'

export default {
  dialect: 'postgresql',
  out: './src/shared/infrastructure/migrations',
  schema: ['./src/shared/infrastructure/drizzle-schema.ts'],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config
