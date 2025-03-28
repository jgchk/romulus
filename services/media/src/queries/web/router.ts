import { type } from 'arktype'
import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/arktype'

import type { GetAllMediaTypesQueryHandler } from '../application/get-all-media-types.js'

export type MediaRouter = ReturnType<typeof createMediaRouter>

const response = type({
  success: 'true',
  mediaTypes: type(
    {
      id: 'string',
      name: 'string',
      parents: 'string[]',
    },
    '[]',
  ),
})

export function createMediaRouter({
  getAllMediaTypes,
}: {
  getAllMediaTypes: GetAllMediaTypesQueryHandler
}) {
  const app = new Hono().get(
    '/media-types',
    describeRoute({
      description: 'Get all media types',
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: resolver(response),
            },
          },
        },
      },
    }),
    async (c) => {
      const mediaTypes = await getAllMediaTypes()
      return c.json({ success: true, mediaTypes } satisfies typeof response.infer)
    },
  )

  return app
}
