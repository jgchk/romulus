import { zValidator as honoZodValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import type { ZodType, ZodTypeDef } from 'zod'

import { setError } from './utils'

export function zodValidator<
  T extends keyof ValidationTargets,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S extends ZodType<any, ZodTypeDef, any>,
>(target: T, schema: S) {
  return honoZodValidator(target, schema, (result, c) => {
    if (!result.success) {
      return setError(
        c,
        {
          name: 'InvalidRequestError',
          message: 'Invalid request',
          details: result.error.issues,
        },
        400,
      )
    }
  })
}
