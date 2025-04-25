import { type MediaTypeEvent } from '../../common/domain/events.js'
import { type IEventStore } from '../../common/infrastructure/event-store.js'
import {
  createMediaTypesProjectionFromEvents,
  type MediaTypesProjection,
} from '../domain/media-types/media-types-projection.js'

export function createGetMediaTypes(eventStore: IEventStore<{ 'media-types': MediaTypeEvent }>) {
  return async function getMediaTypes(): Promise<MediaTypesProjection> {
    const events = await eventStore.get('media-types')
    return createMediaTypesProjectionFromEvents(events.map((event) => event.eventData))
  }
}

export function createSaveMediaTypeEvent(
  eventStore: IEventStore<{ 'media-types': MediaTypeEvent }>,
) {
  return async function saveEvent(event: MediaTypeEvent): Promise<void> {
    await eventStore.save('media-types', [event])
  }
}
