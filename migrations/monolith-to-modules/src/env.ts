import { type } from 'arktype'

const envSchema = type({
  MONOLITH_DATABASE_URL: 'string > 0',
  AUTHENTICATION_DATABASE_URL: 'string > 0',
})

const envResult = envSchema(process.env)

if (envResult instanceof type.errors) {
  console.error(envResult.summary)
  process.exit(1)
}

export const env = envResult
