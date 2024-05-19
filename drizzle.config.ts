import 'dotenv/config'
// make sure to install dotenv package
import type { Config } from 'drizzle-kit'

export default {
  driver: 'pg',
  out: './src/lib/server/db/migrations',
  schema: './src/lib/server/db/schema/*',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
} satisfies Config
