import { Hono } from 'hono'

import { type GetMediaArtifactRelationshipTypeQueryHandler } from '../application/media-artifact-relationship-types/get-media-artifact-relationship-type.js'
import { type GetAllMediaArtifactTypesQueryHandler } from '../application/media-artifact-types/get-all-media-artifact-types.js'
import { type GetMediaArtifactTypeQueryHandler } from '../application/media-artifact-types/get-media-artifact-type.js'
import { type GetMediaArtifactTypesByMediaTypeQueryHandler } from '../application/media-artifact-types/get-media-artifact-types-by-media-type.js'
import { type GetAllMediaTypesQueryHandler } from '../application/media-types/get-all-media-types.js'
import { type GetMediaTypeQueryHandler } from '../application/media-types/get-media-type.js'
import { createGetMediaArtifactRelationshipTypeRoute } from './routes/media-artifact-relationship-type.ts/get-media-artifact-relationship-type.js'
import { createGetAllMediaArtifactTypesRoute } from './routes/media-artifact-types/get-all-media-artifact-types.js'
import { createGetMediaArtifactTypeRoute } from './routes/media-artifact-types/get-media-artifact-type.js'
import { createGetMediaArtifactTypesByMediaTypeRoute } from './routes/media-artifact-types/get-media-artifact-types-by-media-type.js'
import { createGetAllMediaTypesRoute } from './routes/media-types/get-all-media-types.js'
import { createGetMediaTypeRoute } from './routes/media-types/get-media-type.js'

export type MediaQueriesRouter = ReturnType<typeof createMediaQueriesRouter>

export function createMediaQueriesRouter({
  getAllMediaTypes,
  getMediaType,
  getAllMediaArtifactTypes,
  getMediaArtifactTypesByMediaType,
  getMediaArtifactType,
  getMediaArtifactRelationshipType,
}: {
  getAllMediaTypes: GetAllMediaTypesQueryHandler
  getMediaType: GetMediaTypeQueryHandler
  getAllMediaArtifactTypes: GetAllMediaArtifactTypesQueryHandler
  getMediaArtifactTypesByMediaType: GetMediaArtifactTypesByMediaTypeQueryHandler
  getMediaArtifactType: GetMediaArtifactTypeQueryHandler
  getMediaArtifactRelationshipType: GetMediaArtifactRelationshipTypeQueryHandler
}) {
  const app = new Hono()
    .get('/media-types', ...createGetAllMediaTypesRoute({ getAllMediaTypes }))
    .get('/media-types/:id', ...createGetMediaTypeRoute({ getMediaType }))
    .get(
      '/media-types/:id/media-artifact-types',
      ...createGetMediaArtifactTypesByMediaTypeRoute({ getMediaArtifactTypesByMediaType }),
    )
    .get(
      '/media-artifact-types',
      ...createGetAllMediaArtifactTypesRoute({ getAllMediaArtifactTypes }),
    )
    .get('/media-artifact-types/:id', ...createGetMediaArtifactTypeRoute({ getMediaArtifactType }))
    .get(
      '/media-artifact-relationship-types/:id',
      ...createGetMediaArtifactRelationshipTypeRoute({ getMediaArtifactRelationshipType }),
    )

  return app
}
