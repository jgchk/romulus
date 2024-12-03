import type { IEventStore } from '../shared/domain/event-store'
import type { MediaTypeTreeEvent } from '../shared/domain/events'
import { MemoryEventStore } from '../shared/infrastructure/memory-event-store'
import { GetMediaTypeTreeQueryHandler } from './application/get-media-type-tree'
import type { IMediaTypeTreeRepository } from './domain/repository'
import { MemoryTreeRepository } from './infrastructure/memory-tree-repository'

export class MediaQueriesCompositionRoot {
  getMediaTypeTreeQueryHandler(): GetMediaTypeTreeQueryHandler {
    return new GetMediaTypeTreeQueryHandler(this.treeRepository())
  }

  private treeRepository(): IMediaTypeTreeRepository {
    return new MemoryTreeRepository(this.eventStore())
  }

  private eventStore(): IEventStore<MediaTypeTreeEvent> {
    return new MemoryEventStore()
  }
}
