import type { IEventStore } from '../domain/event-store/event-store'
import { AddParentToMediaTypeEvent } from '../domain/media-type-tree/events/add-parent-to-media-type'
import type { IMediaTypeTreeRepository } from '../domain/media-type-tree/repository'
import type { CycleError, MediaTypeNotFoundError } from '../domain/media-type-tree/tree'

export class AddMediaTypeParent {
  constructor(
    private mediaTypeTreeRepo: IMediaTypeTreeRepository,
    private eventStore: IEventStore,
  ) {}

  async execute(id: number, parentId: number): Promise<void | MediaTypeNotFoundError | CycleError> {
    const tree = await this.mediaTypeTreeRepo.get()

    const event = new AddParentToMediaTypeEvent(id, parentId)
    const result = event.process(tree)
    if (result instanceof Error) {
      return result
    }

    await this.eventStore.save(event)
  }
}
