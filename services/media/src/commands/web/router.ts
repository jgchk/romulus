import { type } from 'arktype'
import { Hono } from 'hono'
import { validator } from 'hono-openapi/arktype'

import type { CreateMediaTypeCommandHandler } from '../application/create-media-type.js'
import { MediaTypeTreeCycleError } from '../domain/errors.js'
import { routes } from './routes.js'

export type MediaRouter = ReturnType<typeof createMediaRouter>

export function createMediaRouter({
  createMediaType,
}: {
  createMediaType: CreateMediaTypeCommandHandler
}) {
  const app = new Hono().post(
    '/media-types',
    routes.createMediaType.route(),
    validator(
      'json',
      type({
        id: 'string',
        name: 'string',
        parents: 'string[]',
      }),
    ),
    async (c) => {
      const body = c.req.valid('json')
      const result = await createMediaType({ mediaType: body })

      return result.match(
        () =>
          c.json(
            { success: true } satisfies typeof routes.createMediaType.successResponse.infer,
            200,
          ),
        (err) => {
          if (err instanceof MediaTypeTreeCycleError) {
            return c.json(
              {
                success: false,
                error: {
                  name: err.name,
                  message: err.message,
                  statusCode: 400,
                },
              } satisfies typeof routes.createMediaType.errorResponse.infer,
              400,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    },
  )

  return app
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here")
}
