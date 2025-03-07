import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import { artifactTable } from '../infrastructure/drizzle-schema.js'

export type GetArtifactQuery = {
  id: string
}

export function createGetArtifactQueryHandler(db: IDrizzleConnection) {
  return async function (query: GetArtifactQuery) {
    const artifact = await db.query.artifactTable.findFirst({
      where: eq(artifactTable.id, query.id),
      with: {
        attributes: {
          columns: {
            id: true,
            value: true,
          },
        },
        schema: {
          columns: {},
          with: {
            attributes: {
              columns: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    })

    if (artifact === undefined) return

    return artifact
  }
}
