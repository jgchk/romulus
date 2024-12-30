import { eq } from 'drizzle-orm'

import type { ArtifactsEvent } from '../../commands/domain/events'
import type { IDrizzleConnection } from './drizzle-database'
import {
  artifactAttributeSchemaTable,
  artifactAttributeTable,
  artifactSchemaTable,
  artifactTable,
  relationAttributeSchemaTable,
  relationAttributeTable,
  relationSchemaTable,
  relationTable,
} from './drizzle-schema'

async function applyEvent(event: ArtifactsEvent, db: IDrizzleConnection) {
  switch (event.kind) {
    case 'artifact-schema-defined': {
      await db.transaction(async (tx) => {
        await tx
          .insert(artifactSchemaTable)
          .values({
            id: event.artifactSchema.id,
            name: event.artifactSchema.name,
          })
          .onConflictDoUpdate({
            target: artifactSchemaTable.id,
            set: { name: event.artifactSchema.name },
          })

        await tx
          .delete(artifactAttributeSchemaTable)
          .where(eq(artifactAttributeSchemaTable.artifactSchemaId, event.artifactSchema.id))

        if (event.artifactSchema.attributes.length > 0) {
          await tx.insert(artifactAttributeSchemaTable).values(
            event.artifactSchema.attributes.map((attribute) => ({
              artifactSchemaId: event.artifactSchema.id,
              id: attribute.id,
              name: attribute.name,
              type: attribute.type,
            })),
          )
        }
      })
      return
    }

    case 'relation-schema-defined': {
      await db.transaction(async (tx) => {
        await tx.insert(relationSchemaTable).values({
          id: event.relationSchema.id,
          name: event.relationSchema.name,
          type: event.relationSchema.type,
          sourceArtifactSchemaId: event.relationSchema.sourceArtifactSchema,
          targetArtifactSchemaId: event.relationSchema.targetArtifactSchema,
        })

        await tx
          .delete(relationAttributeSchemaTable)
          .where(eq(relationAttributeSchemaTable.relationSchemaId, event.relationSchema.id))

        if (event.relationSchema.attributes.length > 0) {
          await tx.insert(relationAttributeSchemaTable).values(
            event.relationSchema.attributes.map((attribute) => ({
              relationSchemaId: event.relationSchema.id,
              id: attribute.id,
              name: attribute.name,
              type: attribute.type,
            })),
          )
        }
      })
      return
    }

    case 'artifact-registered': {
      await db.transaction(async (tx) => {
        await tx.insert(artifactTable).values({
          id: event.artifact.id,
          schemaId: event.artifact.schema,
        })

        await tx
          .delete(artifactAttributeSchemaTable)
          .where(eq(artifactAttributeSchemaTable.artifactSchemaId, event.artifact.schema))

        if (event.artifact.attributes.length > 0) {
          await tx.insert(artifactAttributeTable).values(
            event.artifact.attributes.map((attribute) => ({
              artifactId: event.artifact.id,
              id: attribute.id,
              value: attribute.value,
            })),
          )
        }
      })
      return
    }

    case 'relation-registered': {
      await db.transaction(async (tx) => {
        await tx.insert(relationTable).values({
          id: event.relation.id,
          schemaId: event.relation.schema,
          sourceArtifactId: event.relation.sourceArtifact,
          targetArtifactId: event.relation.targetArtifact,
        })

        await tx
          .delete(relationAttributeTable)
          .where(eq(relationAttributeTable.relationId, event.relation.id))

        if (event.relation.attributes.length > 0) {
          await tx.insert(relationAttributeTable).values(
            event.relation.attributes.map((attribute) => ({
              relationId: event.relation.id,
              id: attribute.id,
              value: attribute.value,
            })),
          )
        }
      })
      return
    }

    default: {
      event satisfies never
    }
  }
}
