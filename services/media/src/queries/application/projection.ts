import { eq } from 'drizzle-orm'

import type { MediaTypeEvent } from '../../common/domain/events.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import { mediaTypeParents, mediaTypes } from '../infrastructure/drizzle-schema.js'

export async function applyEvent(db: IDrizzleConnection, event: MediaTypeEvent) {
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
  }
}
