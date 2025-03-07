import type { IEventStore } from '../../shared/domain/event-store.js'
import type { MediaTypeTreeEvent } from '../../shared/domain/events.js'
import type { IMediaTypeTreeRepository } from '../domain/repository.js'
import { MediaTypeTree } from '../domain/tree.js'

export class MemoryTreeRepository implements IMediaTypeTreeRepository {
  constructor(private store: IEventStore<MediaTypeTreeEvent>) {}

  get(id: string) {
    const events = this.store.get('media-type-trees')
    return MediaTypeTree.fromEvents(id, events ?? [])
  }

  save(tree: MediaTypeTree) {
    this.store.save('media-type-trees', tree.getUncommittedEvents())
  }
}
