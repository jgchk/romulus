import type { IEventStore } from '../domain/event-store/event-store'
import type { IMediaTypeTreeRepository } from '../domain/media-type-tree/repository'

export class AddMediaTypeCommand {
  constructor(
    private mediaTypeTreeRepo: IMediaTypeTreeRepository,
    private eventStore: IEventStore,
  ) {}

  async execute(): Promise<{ id: number }> {
    const tree = await this.mediaTypeTreeRepo.get()

    const event = tree.addMediaType()

    await this.eventStore.save(event)

    return { id: event.id }
  }
}
