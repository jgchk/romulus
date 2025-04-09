import type { MediaArtifactTypeEvent } from '../../common/domain/events.js'
import type { IEventStore } from '../../common/infrastructure/event-store.js'
import {
  createMediaArtifactTypesProjectionFromEvents,
  type MediaArtifactTypesProjection,
} from '../domain/media-artifact-types/media-artifact-types-projection.js'

export function createGetMediaArtifactTypes(
  eventStore: IEventStore<Record<`media-artifact-type-${string}`, MediaArtifactTypeEvent>>,
) {
  return async function getMediaArtifactTypes(
    mediaType: string,
  ): Promise<MediaArtifactTypesProjection> {
    const events = await eventStore.get(`media-artifact-type-${mediaType}`)
    return createMediaArtifactTypesProjectionFromEvents(events)
  }
}

export function createSaveMediaArtifactTypeEvent(
  eventStore: IEventStore<Record<`media-artifact-type-${string}`, MediaArtifactTypeEvent>>,
) {
  return async function saveEvent(mediaType: string, event: MediaArtifactTypeEvent): Promise<void> {
    await eventStore.save(`media-artifact-type-${mediaType}`, [event])
  }
}
