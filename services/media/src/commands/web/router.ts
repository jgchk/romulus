import { type } from 'arktype'
import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { resolver, validator } from 'hono-openapi/arktype'

import type { CreateMediaTypeCommandHandler } from '../application/create-media-type.js'
import { MediaTypeTreeCycleError } from '../domain/errors.js'

export type MediaRouter = ReturnType<typeof createMediaRouter>

const successResponse = type({
  success: 'true',
})

const errorResponse = type({
  success: 'false',
  error: {
    name: '"MediaTypeTreeCycleError"',
    message: 'string',
    statusCode: '400',
  },
})

export function createMediaRouter({
  createMediaType,
}: {
  createMediaType: CreateMediaTypeCommandHandler
}) {
  const app = new Hono().post(
    '/media-types',
    describeRoute({
      description: 'Get all media types',
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: resolver(successResponse),
            },
          },
        },
        400: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: resolver(errorResponse),
            },
          },
        },
      },
    }),
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
        () => c.json({ success: true } satisfies typeof successResponse.infer, 200),
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
              } satisfies typeof errorResponse.infer,
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
