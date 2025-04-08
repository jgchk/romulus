import { type } from 'arktype'
import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { resolver, validator } from 'hono-openapi/arktype'

import { MediaTypeNotFoundError } from '../../commands/domain/media-types/errors.js'
import type { GetAllMediaTypesQueryHandler } from '../application/get-all-media-types.js'
import type { GetMediaTypeQueryHandler } from '../application/get-media-type.js'
import type { routes } from './routes.js'

export type MediaQueriesRouter = ReturnType<typeof createMediaQueriesRouter>

const getAllMediaTypesResponse = type({
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

const getMediaTypeResponse = type({
  success: 'true',
  mediaType: type({
    id: 'string',
    name: 'string',
    parents: 'string[]',
  }),
})

export function createMediaQueriesRouter({
  getAllMediaTypes,
  getMediaType,
}: {
  getAllMediaTypes: GetAllMediaTypesQueryHandler
  getMediaType: GetMediaTypeQueryHandler
}) {
  const app = new Hono()
    .get(
      '/media-types',
      describeRoute({
        description: 'Get all media types',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(getAllMediaTypesResponse),
              },
            },
          },
        },
      }),
      async (c) => {
        const mediaTypes = await getAllMediaTypes()
        return c.json(
          {
            success: true,
            mediaTypes,
          } satisfies typeof routes.getAllMediaTypes.successResponse.infer,
          200,
        )
      },
    )
    .get(
      '/media-types/:id',
      describeRoute({
        description: 'Get a media type by id',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(getMediaTypeResponse),
              },
            },
          },
        },
      }),
      validator('param', type({ id: 'string' })),
      async (c) => {
        const { id } = c.req.valid('param')
        const mediaType = await getMediaType(id)
        if (mediaType === undefined) {
          const error = new MediaTypeNotFoundError(id)
          return c.json(
            {
              success: false,
              error: { name: error.name, message: error.message, statusCode: 404 },
            } satisfies typeof routes.getMediaType.errorResponse.infer,
            404,
          )
        }
        return c.json(
          { success: true, mediaType } satisfies typeof routes.getMediaType.successResponse.infer,
          200,
        )
      },
    )

  return app
}
