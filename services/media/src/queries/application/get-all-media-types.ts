import type { MediaType } from '../../commands/domain/types.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'

export type GetAllMediaTypesQuery = () => Promise<MediaType[]>

export function createGetAllMediaTypesQuery(db: IDrizzleConnection): GetAllMediaTypesQuery {
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
