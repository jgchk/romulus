import { type } from 'arktype'
import { Hono } from 'hono'

import { MediaArtifactRelationshipTypeNotFoundError } from '../../commands/domain/media-artifact-relationship-types/errors.js'
import { MediaArtifactTypeNotFoundError } from '../../commands/domain/media-artifact-types/errors.js'
import { validator } from '../../common/web/utils.js'
import type { GetMediaArtifactRelationshipTypeQueryHandler } from '../application/media-artifact-relationship-types/get-media-artifact-relationship-type.js'
import type { GetAllMediaArtifactTypesQueryHandler } from '../application/media-artifact-types/get-all-media-artifact-types.js'
import type { GetMediaArtifactTypeQueryHandler } from '../application/media-artifact-types/get-media-artifact-type.js'
import type { GetAllMediaTypesQueryHandler } from '../application/media-types/get-all-media-types.js'
import type { GetMediaTypeQueryHandler } from '../application/media-types/get-media-type.js'
import { routes } from './routes.js'
import { createGetAllMediaTypesRoute } from './routes/media-types/get-all-media-types.js'
import { createGetMediaTypeRoute } from './routes/media-types/get-media-type.js'

export type MediaQueriesRouter = ReturnType<typeof createMediaQueriesRouter>

export function createMediaQueriesRouter({
  getAllMediaTypes,
  getMediaType,
  getAllMediaArtifactTypes,
  getMediaArtifactType,
  getMediaArtifactRelationshipType,
}: {
  getAllMediaTypes: GetAllMediaTypesQueryHandler
  getMediaType: GetMediaTypeQueryHandler
  getAllMediaArtifactTypes: GetAllMediaArtifactTypesQueryHandler
  getMediaArtifactType: GetMediaArtifactTypeQueryHandler
  getMediaArtifactRelationshipType: GetMediaArtifactRelationshipTypeQueryHandler
}) {
  const app = new Hono()
    .get('/media-types', ...createGetAllMediaTypesRoute({ getAllMediaTypes }))
    .get('/media-types/:id', ...createGetMediaTypeRoute({ getMediaType }))
    .get('/media-artifact-types', routes.getAllMediaArtifactTypes.route(), async (c) => {
      const response = await getAllMediaArtifactTypes()
      return c.json({
        success: true,
        ...response,
      } satisfies typeof routes.getAllMediaArtifactTypes.successResponse.infer)
    })
    .get(
      '/media-artifact-types/:id',
      routes.getMediaArtifactType.route(),
      validator('param', type({ id: 'string' })),
      async (c) => {
        const { id } = c.req.valid('param')
        const mediaArtifactType = await getMediaArtifactType(id)
        if (mediaArtifactType === undefined) {
          const error = new MediaArtifactTypeNotFoundError(id)
          return c.json(
            {
              success: false,
              error: { name: error.name, message: error.message, statusCode: 404 },
            } satisfies typeof routes.getMediaArtifactType.errorResponse.infer,
            404,
          )
        }
        return c.json(
          {
            success: true,
            mediaArtifactType,
          } satisfies typeof routes.getMediaArtifactType.successResponse.infer,
          200,
        )
      },
    )
    .get(
      '/media-artifact-relationship-types/:id',
      routes.getMediaArtifactRelationshipType.route(),
      validator('param', type({ id: 'string' })),
      async (c) => {
        const { id } = c.req.valid('param')
        const mediaArtifactRelationshipType = await getMediaArtifactRelationshipType(id)
        if (mediaArtifactRelationshipType === undefined) {
          const error = new MediaArtifactRelationshipTypeNotFoundError(id)
          return c.json(
            {
              success: false,
              error: { name: error.name, message: error.message, statusCode: 404 },
            } satisfies typeof routes.getMediaArtifactRelationshipType.errorResponse.infer,
            404,
          )
        }
        return c.json(
          {
            success: true,
            mediaArtifactRelationshipType,
          } satisfies typeof routes.getMediaArtifactRelationshipType.successResponse.infer,
          200,
        )
      },
    )

  return app
}
