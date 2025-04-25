import { type Type, type } from 'arktype'
import { type Env, type MiddlewareHandler, type TypedResponse, type ValidationTargets } from 'hono'
import { createFactory } from 'hono/factory'
import { type StatusCode } from 'hono/utils/http-status'
import { describeRoute, type DescribeRouteOptions, type HasUndefined } from 'hono-openapi'
import { resolver, validator as arktypeValidator } from 'hono-openapi/arktype'
import { type OpenAPIV3 } from 'openapi-types'

import { type badRequestErrorResponse } from '../../commands/web/errors.js'

export function createErrorResponse<N extends string, SC extends number>(
  name: type.Any<N>,
  statusCode: type.Any<SC>,
) {
  return type({
    success: 'false',
    error: {
      name,
      message: 'string',
      statusCode,
    },
  })
}

export function createErrorResponseWithDetails<
  N extends string,
  SC extends number,
  D extends object,
>(name: type.Any<N>, statusCode: type.Any<SC>, details: type.Any<D>) {
  return type({
    success: 'false',
    error: {
      name,
      message: 'string',
      statusCode,
      details: details,
    },
  })
}

export function createRoute(definition: RouteDefinition) {
  return describeRoute({
    ...definition,
    responses: Object.fromEntries(
      Object.entries(definition.responses).map(([statusCode, responseDefinition]) => [
        statusCode,
        {
          ...responseDefinition,
          content: {
            'application/json': {
              ...responseDefinition.content['application/json'],
              schema: resolver(responseDefinition.content['application/json'].schema),
            },
          },
        },
      ]),
    ),
  })
}

export type RouteDefinition = Omit<DescribeRouteOptions, 'responses'> & {
  responses: Partial<Record<StatusCode, RouteResponseDefinition>>
}

type RouteResponseDefinition = Omit<OpenAPIV3.ResponseObject, 'content'> & {
  content: {
    'application/json': Omit<OpenAPIV3.MediaTypeObject, 'schema'> & { schema: type.Any }
  }
}

export type RouteResponse<
  R extends RouteDefinition,
  // @ts-expect-error - TS isn't smart enough to recognize that keyof R['responses'] is a StatusCode
  K extends StatusCode = keyof R['responses'],
> = {
  [C in K]: TypedResponse<ExtractRouteResponseType<NonNullable<R['responses'][C]>>, C>
}[K]

type ExtractRouteResponseType<R extends RouteResponseDefinition> =
  R['content']['application/json']['schema']['infer']

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
