import type { MediaArtifactType } from '../../../common/domain/types.js'
import type { IDrizzleConnection } from '../../infrastructure/drizzle-database.js'

export type GetMediaArtifactTypesByMediaTypeQueryHandler = (mediaTypeId: string) => Promise<{
  mediaArtifactTypes: MediaArtifactType[]
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
            with: { mediaTypes: { columns: { mediaTypeId: true } } },
          },
        },
      })
      .then((results) =>
        results.map((result) => ({
          ...result.mediaArtifactType,
          mediaTypes: result.mediaArtifactType.mediaTypes.map((mediaType) => mediaType.mediaTypeId),
        })),
      )
    return { mediaArtifactTypes }
  }
}
