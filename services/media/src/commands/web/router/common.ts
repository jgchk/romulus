import type { Type } from 'arktype'
import type { Env, MiddlewareHandler, TypedResponse, ValidationTargets } from 'hono'
import { createFactory } from 'hono/factory'
import type { HasUndefined } from 'hono-openapi'
import { validator as arktypeValidator } from 'hono-openapi/arktype'

import type { badRequestErrorResponse } from '../routes.js'

export const factory = createFactory()

export function validator<
  T extends Type,
  Target extends keyof ValidationTargets,
  E extends Env,
  P extends string,
  I = T['inferIn'],
  O = T['infer'],
  V extends {
    in: HasUndefined<I> extends true ? Partial<Record<Target, I>> : Record<Target, I>
    out: Record<Target, O>
  } = {
    in: HasUndefined<I> extends true ? Partial<Record<Target, I>> : Record<Target, I>
    out: Record<Target, O>
  },
>(target: Target, schema: T): MiddlewareHandler<E, P, V> {
  return arktypeValidator(
    target,
    schema,
    (
      result,
      c,
    ):
      | TypedResponse<
          typeof badRequestErrorResponse.infer,
          (typeof badRequestErrorResponse.infer)['error']['statusCode']
        >
      | undefined => {
      if (!result.success) {
        return c.json(
          {
            success: false,
            error: { name: 'BadRequestError', message: result.errors.summary, statusCode: 400 },
          },
          400,
        )
      }
    },
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here")
}
