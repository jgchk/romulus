import type {
  MediaArtifactRelationshipType,
  MediaArtifactType,
} from '../../../common/domain/types.js'
import type { IDrizzleConnection } from '../../infrastructure/drizzle-database.js'

export type GetMediaArtifactTypesByMediaTypeQueryHandler = (mediaTypeId: string) => Promise<{
  mediaArtifactTypes: MediaArtifactType[]
  mediaArtifactRelationshipTypes: MediaArtifactRelationshipType[]
}>

export function createGetMediaArtifactTypesByMediaTypeQueryHandler(
  db: IDrizzleConnection,
): GetMediaArtifactTypesByMediaTypeQueryHandler {
  return async function (mediaTypeId) {
    const mediaArtifactTypes = await db.query.mediaArtifactTypeMediaTypes
      .findMany({
        where: (mediaArtifactTypeMediaTypes, { eq }) =>
          eq(mediaArtifactTypeMediaTypes.mediaTypeId, mediaTypeId),
        columns: {},
        with: {
          mediaArtifactType: {
            with: {
              mediaTypes: { columns: { mediaTypeId: true } },
            },
          },
        },
      })
      .then((results) =>
        results.map((result) => ({
          ...result.mediaArtifactType,
          mediaTypes: result.mediaArtifactType.mediaTypes.map((mediaType) => mediaType.mediaTypeId),
        })),
      )
    const mediaArtifactTypeIds = mediaArtifactTypes.map(({ id }) => id)

    const mediaArtifactRelationshipTypes = await db.query.mediaArtifactRelationshipTypes
      .findMany({
        where: (mediaArtifactRelationshipTypes, { inArray }) =>
          inArray(mediaArtifactRelationshipTypes.parentMediaArtifactTypeId, mediaArtifactTypeIds),
        with: { childMediaArtifactTypes: { columns: { childMediaArtifactTypeId: true } } },
      })
      .then((results) =>
        results.map(({ parentMediaArtifactTypeId, ...result }) => ({
          ...result,
          parentMediaArtifactType: parentMediaArtifactTypeId,
          childMediaArtifactTypes: result.childMediaArtifactTypes.map(
            ({ childMediaArtifactTypeId }) => childMediaArtifactTypeId,
          ),
        })),
      )

    return { mediaArtifactTypes, mediaArtifactRelationshipTypes }
  }
}
