import { type MediaArtifactTypeEvent } from '../../common/domain/events.js'
import { type IEventStore } from '../../common/infrastructure/event-store.js'
import {
  createMediaArtifactTypesProjectionFromEvents,
  type MediaArtifactTypesProjection,
} from '../domain/media-artifact-types/media-artifact-types-projection.js'

export function createGetMediaArtifactTypes(
  eventStore: IEventStore<{ 'media-artifact-types': MediaArtifactTypeEvent }>,
) {
  return async function getMediaArtifactTypes(): Promise<MediaArtifactTypesProjection> {
    const events = await eventStore.get('media-artifact-types')
    return createMediaArtifactTypesProjectionFromEvents(events.map((event) => event.eventData))
  }
}

export function createSaveMediaArtifactTypeEvent(
  eventStore: IEventStore<{ 'media-artifact-types': MediaArtifactTypeEvent }>,
) {
  return async function saveEvent(event: MediaArtifactTypeEvent): Promise<void> {
    await eventStore.save('media-artifact-types', [event])
  }
}
