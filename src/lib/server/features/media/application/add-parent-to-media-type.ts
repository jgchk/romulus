import type { IEventStore } from '../domain/media-type-tree/event-store'
import type { IMediaTypeTreeRepository } from '../domain/media-type-tree/repository'
import type { CycleError, MediaTypeNotFoundError } from '../domain/media-type-tree/tree'

export class AddParentToMediaTypeCommand {
  constructor(
    private mediaTypeTreeRepo: IMediaTypeTreeRepository,
    private eventStore: IEventStore,
  ) {}

  async execute(id: number, parentId: number): Promise<void | MediaTypeNotFoundError | CycleError> {
    const tree = await this.mediaTypeTreeRepo.get()

    const event = tree.addParentToMediaType(id, parentId)
    if (event instanceof Error) {
      return event
    }

    await this.eventStore.save(event)
  }
}
