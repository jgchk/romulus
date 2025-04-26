import type { Config } from 'drizzle-kit'

export default {
  dialect: 'postgresql',
  out: './src/infrastructure/migrations',
  schema: ['./src/infrastructure/drizzle-schema.ts'],
  verbose: true,
  strict: true,
} satisfies Config
