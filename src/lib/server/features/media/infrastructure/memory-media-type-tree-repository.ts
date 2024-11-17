import type { IEventStore } from '../domain/event-store/event-store'
import type { IMediaTypeTreeRepository } from '../domain/media-type-tree/repository'
import { MediaTypeTree } from '../domain/media-type-tree/tree'

export class MemoryMediaTypeTreeRepository implements IMediaTypeTreeRepository {
  constructor(private eventStore: IEventStore) {}

  async get() {
    const tree = new MediaTypeTree()

    const events = await this.eventStore.get()
    for (const event of events) {
      const result = event.process(tree)
      if (result instanceof Error) {
        // We should never have error sneaking in here since we protect against them
        // before inserting the event.
        throw result
      }
    }

    return tree
  }
}
