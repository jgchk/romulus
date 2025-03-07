import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import { artifactSchemaTable } from '../infrastructure/drizzle-schema.js'

export type GetArtifactSchemaQuery = {
  id: string
}

export function createGetArtifactSchemaQueryHandler(db: IDrizzleConnection) {
  return async function (query: GetArtifactSchemaQuery) {
    const artifactSchema = await db.query.artifactSchemaTable.findFirst({
      where: eq(artifactSchemaTable.id, query.id),
      with: {
        attributes: {
          columns: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    if (artifactSchema === undefined) return

    return artifactSchema
  }
}
