import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '$env/dynamic/private'
import { DATABASE_URL } from '$env/static/private'

import * as schema from './schema'

const queryClient = postgres(DATABASE_URL)
export const db = drizzle(queryClient, { schema, logger: env.LOGGING === 'true' })
