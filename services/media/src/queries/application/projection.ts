import { eq } from 'drizzle-orm'

import type { MediaArtifactTypeEvent, MediaTypeEvent } from '../../common/domain/events.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import {
  mediaArtifactRelationshipTypeChildren,
  mediaArtifactRelationshipTypes,
  mediaArtifactTypeMediaTypes,
  mediaArtifactTypes,
  mediaTypeParents,
  mediaTypes,
} from '../infrastructure/drizzle-schema.js'

export async function applyEvent(
  db: IDrizzleConnection,
  event: MediaTypeEvent | MediaArtifactTypeEvent,
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

    default: {
      event satisfies never
    }
  }
}
