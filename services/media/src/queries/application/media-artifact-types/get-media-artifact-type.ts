import { type MediaArtifactType } from '../../../common/domain/types.js'
import { type IDrizzleConnection } from '../../infrastructure/drizzle-database.js'

export type GetMediaArtifactTypeQueryHandler = (
  id: string,
) => Promise<MediaArtifactType | undefined>

export function createGetMediaArtifactTypeQueryHandler(
  db: IDrizzleConnection,
): GetMediaArtifactTypeQueryHandler {
  return async function getMediaArtifactType(id: string) {
    return db.query.mediaArtifactTypes
      .findFirst({
        where: (mediaArtifact, { eq }) => eq(mediaArtifact.id, id),
        with: { mediaTypes: { columns: { mediaTypeId: true } } },
      })
      .then((result) => {
        if (result === undefined) return undefined

        return {
          ...result,
          mediaTypes: result.mediaTypes.map(({ mediaTypeId }) => mediaTypeId),
        }
      })
  }
}
