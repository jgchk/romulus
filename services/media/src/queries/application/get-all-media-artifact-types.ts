import type { MediaArtifactRelationshipType, MediaArtifactType } from '../../common/domain/types.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'

export type GetAllMediaArtifactTypesQueryHandler = () => Promise<{
  mediaArtifactTypes: MediaArtifactType[]
  mediaArtifactRelationshipTypes: MediaArtifactRelationshipType[]
}>

export function createGetAllMediaArtifactTypesQueryHandler(
  db: IDrizzleConnection,
): GetAllMediaArtifactTypesQueryHandler {
  return async function getAllMediaArtifactTypes() {
    const [mediaArtifactTypes, mediaArtifactRelationshipTypes] = await Promise.all([
      db.query.mediaArtifactTypes
        .findMany({
          with: { mediaTypes: { columns: { mediaTypeId: true } } },
        })
        .then((results) =>
          results.map((result) => ({
            ...result,
            mediaTypes: result.mediaTypes.map(({ mediaTypeId }) => mediaTypeId),
          })),
        ),
      db.query.mediaArtifactRelationshipTypes
        .findMany({
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
        ),
    ])
    return { mediaArtifactTypes, mediaArtifactRelationshipTypes }
  }
}
