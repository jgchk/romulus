import type { MediaType } from '../../../common/domain/types.js'
import type { IDrizzleConnection } from '../../infrastructure/drizzle-database.js'

export type GetMediaTypeQueryHandler = (id: string) => Promise<MediaType | undefined>

export function createGetMediaTypeQueryHandler(db: IDrizzleConnection): GetMediaTypeQueryHandler {
  return async function getMediaType(id: string) {
    return db.query.mediaTypes
      .findFirst({
        where: (mediaTypes, { eq }) => eq(mediaTypes.id, id),
        with: {
          parents: {
            columns: {
              parentId: true,
            },
          },
        },
      })
      .then((result) => {
        if (result === undefined) return undefined

        return {
          ...result,
          parents: result.parents.map((parent) => parent.parentId),
        }
      })
  }
}
