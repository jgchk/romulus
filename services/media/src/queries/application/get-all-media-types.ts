import type { MediaType } from '../../common/domain/types.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'

export type GetAllMediaTypesQueryHandler = () => Promise<MediaType[]>

export function createGetAllMediaTypesQueryHandler(
  db: IDrizzleConnection,
): GetAllMediaTypesQueryHandler {
  return async function getAllMediaTypes() {
    return db.query.mediaTypes
      .findMany({
        with: {
          parents: {
            columns: {
              parentId: true,
            },
          },
        },
      })
      .then((results) =>
        results.map((result) => ({
          ...result,
          parents: result.parents.map((parent) => parent.parentId),
        })),
      )
  }
}
