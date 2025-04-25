import { eq } from 'drizzle-orm'

import {
  type MediaArtifactEvent,
  type MediaArtifactTypeEvent,
  type MediaTypeEvent,
} from '../../common/domain/events.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import {
  mediaArtifactRelationshipTypeChildren,
  mediaArtifactRelationshipTypes,
  mediaArtifacts,
  mediaArtifactTypeMediaTypes,
  mediaArtifactTypes,
  mediaTypeParents,
  mediaTypes,
} from '../infrastructure/drizzle-schema.js'

export async function applyEvent(
  db: IDrizzleConnection,
  event: MediaTypeEvent | MediaArtifactTypeEvent | MediaArtifactEvent,
) {
  switch (event._tag) {
    case 'media-type-created': {
      await db.transaction(async (tx) => {
        await tx
          .insert(mediaTypes)
          .values({ id: event.mediaType.id, name: event.mediaType.name })
          .execute()

        if (event.mediaType.parents.length > 0) {
          await tx
            .insert(mediaTypeParents)
            .values(
              event.mediaType.parents.map((parentId) => ({
                parentId,
                childId: event.mediaType.id,
              })),
            )
            .execute()
        }
      })

      return
    }

    case 'media-type-updated': {
      await db.transaction(async (tx) => {
        await tx
          .update(mediaTypes)
          .set({ name: event.update.name })
          .where(eq(mediaTypes.id, event.id))
          .execute()

        await tx.delete(mediaTypeParents).where(eq(mediaTypeParents.childId, event.id)).execute()

        if (event.update.parents.length > 0) {
          await tx
            .insert(mediaTypeParents)
            .values(
              event.update.parents.map((parentId) => ({
                parentId,
                childId: event.id,
              })),
            )
            .execute()
        }
      })

      return
    }

    case 'media-type-deleted': {
      await db.delete(mediaTypes).where(eq(mediaTypes.id, event.id)).execute()

      return
    }

    case 'media-artifact-type-created': {
      await db.transaction(async (tx) => {
        await tx
          .insert(mediaArtifactTypes)
          .values({ id: event.mediaArtifactType.id, name: event.mediaArtifactType.name })
          .execute()

        if (event.mediaArtifactType.mediaTypes.length > 0) {
          await tx
            .insert(mediaArtifactTypeMediaTypes)
            .values(
              event.mediaArtifactType.mediaTypes.map((mediaTypeId) => ({
                mediaArtifactTypeId: event.mediaArtifactType.id,
                mediaTypeId,
              })),
            )
            .execute()
        }
      })

      return
    }

    case 'media-artifact-type-updated': {
      await db.transaction(async (tx) => {
        await tx
          .update(mediaArtifactTypes)
          .set({ name: event.update.name })
          .where(eq(mediaArtifactTypes.id, event.id))
          .execute()

        await tx
          .delete(mediaArtifactTypeMediaTypes)
          .where(eq(mediaArtifactTypeMediaTypes.mediaArtifactTypeId, event.id))
          .execute()

        if (event.update.mediaTypes.length > 0) {
          await tx
            .insert(mediaArtifactTypeMediaTypes)
            .values(
              event.update.mediaTypes.map((mediaTypeId) => ({
                mediaArtifactTypeId: event.id,
                mediaTypeId,
              })),
            )
            .execute()
        }
      })

      return
    }

    case 'media-artifact-type-deleted': {
      await db.delete(mediaArtifactTypes).where(eq(mediaArtifactTypes.id, event.id)).execute()

      return
    }

    case 'media-artifact-relationship-type-created': {
      await db.transaction(async (tx) => {
        await tx
          .insert(mediaArtifactRelationshipTypes)
          .values({
            id: event.mediaArtifactRelationshipType.id,
            name: event.mediaArtifactRelationshipType.name,
            parentMediaArtifactTypeId: event.mediaArtifactRelationshipType.parentMediaArtifactType,
          })
          .execute()

        if (event.mediaArtifactRelationshipType.childMediaArtifactTypes.length > 0) {
          await tx
            .insert(mediaArtifactRelationshipTypeChildren)
            .values(
              event.mediaArtifactRelationshipType.childMediaArtifactTypes.map(
                (childMediaArtifactTypeId) => ({
                  mediaArtifactRelationshipTypeId: event.mediaArtifactRelationshipType.id,
                  childMediaArtifactTypeId,
                }),
              ),
            )
            .execute()
        }
      })

      return
    }

    case 'media-artifact-relationship-type-updated': {
      await db.transaction(async (tx) => {
        await tx
          .update(mediaArtifactRelationshipTypes)
          .set({
            name: event.update.name,
            parentMediaArtifactTypeId: event.update.parentMediaArtifactType,
          })
          .where(eq(mediaArtifactRelationshipTypes.id, event.id))
          .execute()

        await tx
          .delete(mediaArtifactRelationshipTypeChildren)
          .where(
            eq(mediaArtifactRelationshipTypeChildren.mediaArtifactRelationshipTypeId, event.id),
          )
          .execute()

        if (event.update.childMediaArtifactTypes.length > 0) {
          await tx
            .insert(mediaArtifactRelationshipTypeChildren)
            .values(
              event.update.childMediaArtifactTypes.map((childMediaArtifactTypeId) => ({
                mediaArtifactRelationshipTypeId: event.id,
                childMediaArtifactTypeId,
              })),
            )
            .execute()
        }
      })

      return
    }

    case 'media-artifact-created': {
      await db.insert(mediaArtifacts).values({
        id: event.mediaArtifact.id,
        name: event.mediaArtifact.name,
        mediaArtifactTypeId: event.mediaArtifact.mediaArtifactType,
      })

      return
    }

    default: {
      event satisfies never
    }
  }
}
