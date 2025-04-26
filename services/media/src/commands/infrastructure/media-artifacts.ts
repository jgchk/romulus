import type { MediaArtifactEvent } from '../../common/domain/events.js'
import type { IEventStore } from '../../common/infrastructure/event-store.js'

export function createSaveMediaArtifactEvent(
  eventStore: IEventStore<Record<`media-artifact-id-${string}`, MediaArtifactEvent>>,
) {
  return async function saveEvent(id: string, event: MediaArtifactEvent): Promise<void> {
    await eventStore.save(`media-artifact-id-${id}`, [event])
  }
}
