import { type ArkErrors } from 'arktype'
import { type } from 'arktype'
import { type Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

export type Env = typeof envSchema.infer

const envSchema = type({
  AUTHENTICATION_DATABASE_URL: 'string > 0',
  AUTHORIZATION_DATABASE_URL: 'string > 0',
  USER_SETTINGS_DATABASE_URL: 'string > 0',
  GENRES_DATABASE_URL: 'string > 0',
  MEDIA_DATABASE_URL: 'string > 0',

  ENABLE_DEV_ADMIN_ACCOUNT: '"true" | "false"',
}).pipe((env) => ({ ...env, ENABLE_DEV_ADMIN_ACCOUNT: env.ENABLE_DEV_ADMIN_ACCOUNT === 'true' }))

export function readEnvironmentVariables(): Result<Env, ArkErrors> {
  const envResult = envSchema(process.env)

  if (envResult instanceof type.errors) {
    return err(envResult)
  }

  return ok(envResult)
}
