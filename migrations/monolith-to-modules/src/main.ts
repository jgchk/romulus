import 'dotenv/config'

import { pg as authenticationPg } from '@romulus/authentication/infrastructure'
import { pg as authorizationPg } from '@romulus/authorization/infrastructure'
import { pg as genresPg } from '@romulus/genres/infrastructure'
import { pg as userSettingsPg } from '@romulus/user-settings/infrastructure'
import postgres from 'postgres'

import { env } from './env.js'
import { migrateAccounts } from './modules/accounts.js'
import { migrateGenres } from './modules/genres.js'
import { migratePermissions } from './modules/permissions.js'
import { migrateUserSettings } from './modules/user-settings.js'

async function main() {
  console.log('Migrating accounts...')
  const authenticationDrizzle = authenticationPg.getDbConnection(
    postgres(env.AUTHENTICATION_DATABASE_URL),
  )
  await migrateAccounts(
    async () => {
      await authenticationPg.migrate(authenticationDrizzle)
    },
    async (query) => {
      await authenticationDrizzle.execute(query)
    },
  )
  await authenticationDrizzle.close()
  console.log('Migrated accounts')

  console.log('Migrating permissions...')
  const authorizationDrizzle = authorizationPg.getDbConnection(
    postgres(env.AUTHORIZATION_DATABASE_URL),
  )
  await migratePermissions(
    async () => {
      await authorizationPg.migrate(authorizationDrizzle)
    },
    async (query) => {
      await authorizationDrizzle.execute(query)
    },
  )
  await authorizationDrizzle.close()
  console.log('Migrated permissions')

  console.log('Migrating user settings...')
  const userSettingsDrizzle = userSettingsPg.getDbConnection(
    postgres(env.USER_SETTINGS_DATABASE_URL),
  )
  await migrateUserSettings(
    async () => {
      await userSettingsPg.migrate(userSettingsDrizzle)
    },
    async (query) => {
      await userSettingsDrizzle.execute(query)
    },
  )
  await userSettingsDrizzle.close()
  console.log('Migrated user settings')

  console.log('Migrating genres...')
  const genresDrizzle = genresPg.getDbConnection(postgres(env.GENRES_DATABASE_URL))
  await migrateGenres(
    async () => {
      await genresPg.migrate(genresDrizzle)
    },
    async (query) => {
      await genresDrizzle.execute(query)
    },
  )
  await genresDrizzle.close()
  console.log('Migrated genres')
}

await main()
