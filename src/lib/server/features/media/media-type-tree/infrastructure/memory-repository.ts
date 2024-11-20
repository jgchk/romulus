import type { IMediaTypeTreeEventStore } from '../domain/event-store'
import type { IMediaTypeTreeRepository } from '../domain/repository'
import { MediaTypeTree } from '../../media-type-branches/domain/tree'

export class MemoryMediaTypeTreeRepository implements IMediaTypeTreeRepository {
  constructor(private eventStore: IMediaTypeTreeEventStore) {}

  async get() {
    const events = await this.eventStore.get()
    return MediaTypeTree.fromEvents(events)
  }

  async save(tree: MediaTypeTree) {
    const uncommittedEvents = tree.getUncommittedEvents()
    for (const uncommitedEvent of uncommittedEvents) {
      await this.eventStore.save(uncommitedEvent)
    }
  }
}
