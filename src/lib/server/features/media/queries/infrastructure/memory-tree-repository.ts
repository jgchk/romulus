import type { IEventStore } from '../../shared/domain/event-store'
import type { MediaTypeTreeEvent } from '../../shared/domain/events'
import { MediaTypeTree } from '../domain/media-type-tree'
import type { IMediaTypeTreeRepository } from '../domain/repository'

export class MemoryTreeRepository implements IMediaTypeTreeRepository {
  constructor(private store: IEventStore<MediaTypeTreeEvent>) {}

  get(id: string) {
    const events = this.store.get('media-type-trees')
    return MediaTypeTree.fromEvents(id, events ?? [])
  }
}
