import { pg } from '@romulus/authentication/infrastructure'
import postgres from 'postgres'

import { env } from './env.js'
import { migrateAccounts } from './modules/accounts.js'

async function main() {
  const pg_ = postgres(env.AUTHENTICATION_DATABASE_URL)
  const drizzle = pg.getDbConnection(pg_)

  await migrateAccounts(
    async () => {
      await pg.migrate(drizzle)
    },
    async (query) => {
      await drizzle.execute(query)
    },
  )
}

await main()
