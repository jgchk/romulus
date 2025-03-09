import { type } from 'arktype'

const envSchema = type({
  AUTHENTICATION_DATABASE_URL: 'string > 0',
  AUTHORIZATION_DATABASE_URL: 'string > 0',
  USER_SETTINGS_DATABASE_URL: 'string > 0',
  GENRES_DATABASE_URL: 'string > 0',

  ENABLE_DEV_ADMIN_ACCOUNT: '"true" | "false"',
}).pipe((env) => ({ ...env, ENABLE_DEV_ADMIN_ACCOUNT: env.ENABLE_DEV_ADMIN_ACCOUNT === 'true' }))

const envResult = envSchema(process.env)

if (envResult instanceof type.errors) {
  console.error(envResult.summary)
  process.exit(1)
}

export const env = envResult
