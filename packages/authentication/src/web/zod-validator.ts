import { zValidator as honoZodValidator } from '@hono/zod-validator'
import type { Env, Input, MiddlewareHandler, ValidationTargets } from 'hono'
import type { z } from 'zod'

import { setError } from './utils'

export function zodValidator<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends z.ZodType<any, z.ZodTypeDef, any>,
  Target extends keyof ValidationTargets,
  E extends Env,
  P extends string,
  In = z.input<T>,
  Out = z.output<T>,
  I extends Input = {
    in: HasUndefined<In> extends true
      ? {
          [K in Target]?:
            | (In extends ValidationTargets[K]
                ? In
                : {
                    [K2 in keyof In]?: ValidationTargets[K][K2] | undefined
                  })
            | undefined
        }
      : {
          [K_1 in Target]: In extends ValidationTargets[K_1]
            ? In
            : {
                [K2_1 in keyof In]: ValidationTargets[K_1][K2_1]
              }
        }
    out: Record<Target, Out>
  },
  V extends I = I,
>(target: Target, schema: T): MiddlewareHandler<E, P, V> {
  // @ts-expect-error - This is a hack to get around the fact that zod-validator does not have a proper type
  return honoZodValidator(target, schema, (result, c) => {
    if (!result.success) {
      return setError(
        c,
        { name: 'InvalidRequestError', message: 'Invalid request', details: result.error.issues },
        400,
      )
    }
  })
}

type HasUndefined<T> = undefined extends T ? true : false
