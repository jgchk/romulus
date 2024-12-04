import type { IEventStore } from '../shared/domain/event-store'
import type { MediaTypeTreeEvent } from '../shared/domain/events'
import { MemoryEventStore } from '../shared/infrastructure/memory-event-store'
import { AddMediaTypeCommandHandler } from './application/add-media-type'
import { AddParentToMediaTypeCommandHandler } from './application/add-parent-to-media-type'
import { CopyTreeCommandHandler } from './application/copy-tree'
import { CreateTreeCommandHandler } from './application/create-tree'
import { MergeTreesCommandHandler } from './application/merge-trees'
import { RemoveMediaTypeCommandHandler } from './application/remove-media-type'
import { RequestMergeTreesCommandHandler } from './application/request-merge'
import { SetMainTreeCommandHandler } from './application/set-main-tree'
import type { IMediaTypeTreeRepository } from './domain/repository'
import { MemoryTreeRepository } from './infrastructure/memory-tree-repository'

export class CommandsCompositionRoot {
  addMediaTypeCommandHandler(): AddMediaTypeCommandHandler {
    return new AddMediaTypeCommandHandler(this.treeRepository())
  }

  addParentToMediaTypeCommandHandler(): AddParentToMediaTypeCommandHandler {
    return new AddParentToMediaTypeCommandHandler(this.treeRepository())
  }

  copyTreeCommandHandler(): CopyTreeCommandHandler {
    return new CopyTreeCommandHandler(this.treeRepository())
  }

  createTreeCommandHandler(): CreateTreeCommandHandler {
    return new CreateTreeCommandHandler(this.treeRepository())
  }

  mergeTreesCommandHandler(): MergeTreesCommandHandler {
    return new MergeTreesCommandHandler(this.treeRepository())
  }

  removeMediaTypeCommandHandler(): RemoveMediaTypeCommandHandler {
    return new RemoveMediaTypeCommandHandler(this.treeRepository())
  }

  requestMergeTreesCommandHandler(): RequestMergeTreesCommandHandler {
    return new RequestMergeTreesCommandHandler(this.treeRepository())
  }

  setMainTreeCommandHandler(): SetMainTreeCommandHandler {
    return new SetMainTreeCommandHandler(this.treeRepository())
  }

  private treeRepository(): IMediaTypeTreeRepository {
    return new MemoryTreeRepository(this.eventStore())
  }

  private eventStore(): IEventStore<MediaTypeTreeEvent> {
    return new MemoryEventStore()
  }
}
