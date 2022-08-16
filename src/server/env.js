// @ts-check
/**
 * This file is included in `/next.config.js` which ensures the app isn't built with invalid env vars.
 * It has to be a `.js`-file to be imported there.
 */
const { z } = require('zod')

/*eslint sort-keys: "error"*/
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  SYSTEM_USERNAME: z.string(),
  SYSTEM_PASSWORD: z.string(),
  SPOTIFY_ID: z.string(),
  SPOTIFY_SECRET: z.string(),
})

const env = envSchema.safeParse(process.env)

if (!env.success) {
  const { _errors, ...originalErrors } = env.error.format()

  const allErrors = { ...originalErrors }

  if (_errors.length > 0) {
    // @ts-ignore
    allErrors.errors = _errors
  }

  for (const key of Object.keys(allErrors)) {
    if (key === '_errors') continue

    const formattedErrors = { value: process.env[key] }

    // @ts-ignore
    const errors = allErrors[key]._errors
    if (errors.length === 1) {
      // @ts-ignore
      formattedErrors.error = errors[0]
    } else {
      // @ts-ignore
      formattedErrors.errors = errors
    }

    // @ts-ignore
    allErrors[key] = formattedErrors
  }

  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(allErrors, null, 4)
  )
  process.exit(1)
}
module.exports.env = env.data
