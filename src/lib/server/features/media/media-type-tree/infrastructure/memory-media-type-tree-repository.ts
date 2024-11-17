import type { IEventStore } from '../domain/event-store'
import type { IMediaTypeTreeRepository } from '../domain/repository'
import { MediaTypeTree } from '../domain/tree'

export class MemoryMediaTypeTreeRepository implements IMediaTypeTreeRepository {
  constructor(private eventStore: IEventStore) {}

  async get() {
    const tree = new MediaTypeTree()

    const events = await this.eventStore.get()
    for (const event of events) {
      tree.apply(event)
    }

    return tree
  }
}
