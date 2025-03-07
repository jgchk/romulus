import type { IEventStore } from '../shared/domain/event-store.js'
import type { MediaTypeTreeEvent } from '../shared/domain/events.js'
import { MemoryEventStore } from '../shared/infrastructure/memory-event-store.js'
import { AddMediaTypeCommandHandler } from './application/add-media-type.js'
import { AddParentToMediaTypeCommandHandler } from './application/add-parent-to-media-type.js'
import { CopyTreeCommandHandler } from './application/copy-tree.js'
import { CreateTreeCommandHandler } from './application/create-tree.js'
import { MergeTreesCommandHandler } from './application/merge-trees.js'
import { RemoveMediaTypeCommandHandler } from './application/remove-media-type.js'
import { RequestMergeTreesCommandHandler } from './application/request-merge.js'
import { SetMainTreeCommandHandler } from './application/set-main-tree.js'
import type { IMediaTypeTreeRepository } from './domain/repository.js'
import { MemoryTreeRepository } from './infrastructure/memory-tree-repository.js'

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
