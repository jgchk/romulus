import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import path from 'path'
import postgres from 'postgres'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsFolder = path.join(__dirname, './migrations')

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

const sql = postgres(databaseUrl, { max: 1 })
const db = drizzle(sql, { logger: true })

console.log('Migrating database...')

await migrate(db, { migrationsFolder })

console.log('Database migrated successfully!')

await sql.end()
