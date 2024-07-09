import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'
import { Database } from './wrapper'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

const queryClient = postgres(databaseUrl)
const drizzleClient = drizzle(queryClient, {
  schema,
  logger: process.env.LOGGING === 'true',
})

export const db = new Database(drizzleClient)
