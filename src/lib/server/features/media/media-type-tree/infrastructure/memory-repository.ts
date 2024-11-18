import type { IMediaTypeTreeEventStore } from '../domain/event-store'
import type { IMediaTypeTreeRepository } from '../domain/repository'
import { MediaTypeTree } from '../domain/tree'

export class MemoryMediaTypeTreeRepository implements IMediaTypeTreeRepository {
  constructor(private eventStore: IMediaTypeTreeEventStore) {}

  async get() {
    const tree = MediaTypeTree.create()

    const events = await this.eventStore.get()
    for (const event of events) {
      tree.apply(event)
    }

    return tree
  }
}
