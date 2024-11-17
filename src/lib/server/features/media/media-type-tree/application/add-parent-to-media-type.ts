import type { IMediaTypeTreeEventStore } from '../domain/event-store'
import type { IMediaTypeTreeRepository } from '../domain/repository'
import type { CycleError, MediaTypeNotFoundError } from '../domain/tree'

export class AddParentToMediaTypeCommand {
  constructor(
    private mediaTypeTreeRepo: IMediaTypeTreeRepository,
    private eventStore: IMediaTypeTreeEventStore,
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
