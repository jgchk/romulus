import { type MediaArtifactRelationshipType } from '../../../common/domain/types.js'
import { type IDrizzleConnection } from '../../infrastructure/drizzle-database.js'

export type GetMediaArtifactRelationshipTypeQueryHandler = (
  id: string,
) => Promise<MediaArtifactRelationshipType | undefined>

export function createGetMediaArtifactRelationshipTypeQueryHandler(
  db: IDrizzleConnection,
): GetMediaArtifactRelationshipTypeQueryHandler {
  return async function getMediaArtifactRelationshipType(id: string) {
    return db.query.mediaArtifactRelationshipTypes
      .findFirst({
        where: (mediaArtifactRelationshipTypes, { eq }) =>
          eq(mediaArtifactRelationshipTypes.id, id),
        with: {
          childMediaArtifactTypes: {
            columns: {
              childMediaArtifactTypeId: true,
            },
          },
        },
      })
      .then((result) => {
        if (result === undefined) return undefined

        return {
          id: result.id,
          name: result.name,
          parentMediaArtifactType: result.parentMediaArtifactTypeId,
          childMediaArtifactTypes: result.childMediaArtifactTypes.map(
            (child) => child.childMediaArtifactTypeId,
          ),
        }
      })
  }
}
