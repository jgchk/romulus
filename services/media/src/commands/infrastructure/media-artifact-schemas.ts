import type { MediaArtifactSchemaEvent } from '../../common/domain/events.js'
import type { IEventStore } from '../../common/infrastructure/event-store.js'

export function createSaveMediaArtifactSchemaEvent(
  eventStore: IEventStore<Record<`media-artifact-schema-${string}`, MediaArtifactSchemaEvent>>,
) {
  return async function saveEvent(
    mediaType: string,
    event: MediaArtifactSchemaEvent,
  ): Promise<void> {
    await eventStore.save(`media-artifact-schema-${mediaType}`, [event])
  }
}
