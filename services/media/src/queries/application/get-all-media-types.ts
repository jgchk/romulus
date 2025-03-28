import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'

export function createGetAllMediaTypesQuery(db: IDrizzleConnection) {
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
