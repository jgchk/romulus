import { type } from 'arktype'
import { Hono } from 'hono'
import { validator } from 'hono-openapi/arktype'

import { MediaTypeNotFoundError } from '../../commands/domain/media-types/errors.js'
import type { GetAllMediaArtifactTypesQueryHandler } from '../application/get-all-media-artifact-types.js'
import type { GetAllMediaTypesQueryHandler } from '../application/get-all-media-types.js'
import type { GetMediaTypeQueryHandler } from '../application/get-media-type.js'
import { routes } from './routes.js'

export type MediaQueriesRouter = ReturnType<typeof createMediaQueriesRouter>

export function createMediaQueriesRouter({
  getAllMediaTypes,
  getMediaType,
  getAllMediaArtifactTypes,
}: {
  getAllMediaTypes: GetAllMediaTypesQueryHandler
  getMediaType: GetMediaTypeQueryHandler
  getAllMediaArtifactTypes: GetAllMediaArtifactTypesQueryHandler
}) {
  const app = new Hono()
    .get('/media-types', routes.getAllMediaTypes.route(), async (c) => {
      const mediaTypes = await getAllMediaTypes()
      return c.json(
        {
          success: true,
          mediaTypes,
        } satisfies typeof routes.getAllMediaTypes.successResponse.infer,
        200,
      )
    })
    .get(
      '/media-types/:id',
      routes.getMediaType.route(),
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
    .get('/media-artifact-types', routes.getAllMediaArtifactTypes.route(), async (c) => {
      const response = await getAllMediaArtifactTypes()
      return c.json({
        success: true,
        ...response,
      } satisfies typeof routes.getAllMediaArtifactTypes.successResponse.infer)
    })

  return app
}
