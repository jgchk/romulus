import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { type PgliteDatabase } from 'drizzle-orm/pglite'
import { migrate as drizzleMigratePGlite } from 'drizzle-orm/pglite/migrator'
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { migrate as drizzleMigratePostgres } from 'drizzle-orm/postgres-js/migrator'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsFolder = path.join(__dirname, './migrations')

export async function migratePGlite<S extends Record<string, unknown>>(db: PgliteDatabase<S>) {
  await drizzleMigratePGlite(db, { migrationsFolder })
}

export async function migratePostgres<S extends Record<string, unknown>>(
  db: PostgresJsDatabase<S>,
) {
  await drizzleMigratePostgres(db, { migrationsFolder })
}
