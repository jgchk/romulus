import z from 'zod'

const envSchema = z.object({
  SYSTEM_USER_TOKEN: z.string().min(40),
  AUTHORIZATION_SERVICE_URL: z.string().min(1),
})

const envResult = envSchema.safeParse(process.env)

if (!envResult.success) {
  console.error(envResult.error.issues)
  process.exit(1)
}

export const env = envResult.data
