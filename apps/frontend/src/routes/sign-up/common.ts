import { z } from 'zod'

export const signUpSchema = z
  .object({
    username: z.string(),
    password: z.object({
      password: z.string(),
      confirmPassword: z.string(),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password.password !== data.password.confirmPassword) {
      return ctx.addIssue({
        path: ['password', 'confirmPassword'],
        message: 'Passwords do not match',
        code: 'custom',
      })
    }
  })
