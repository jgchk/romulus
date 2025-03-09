import 'dotenv/config'

import { readEnvironmentVariables } from './env.js'
import { main } from './main.js'

const envResult = readEnvironmentVariables()
if (envResult.isErr()) {
  console.error(envResult.error.summary)
  process.exit(1)
}
const env = envResult.value

void main({
  config: {
    authenticationDatabaseUrl: env.AUTHENTICATION_DATABASE_URL,
    authorizationDatabaseUrl: env.AUTHORIZATION_DATABASE_URL,
    genresDatabaseUrl: env.GENRES_DATABASE_URL,
    userSettingsDatabaseUrl: env.USER_SETTINGS_DATABASE_URL,

    enableDevAdminAccount: env.ENABLE_DEV_ADMIN_ACCOUNT,
  },
})
