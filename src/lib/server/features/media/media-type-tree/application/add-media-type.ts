import type { IMediaTypeTreeEventStore } from '../domain/event-store'
import type { IMediaTypeTreeRepository } from '../domain/repository'

export class AddMediaTypeCommand {
  constructor(
    private mediaTypeTreeRepo: IMediaTypeTreeRepository,
    private eventStore: IMediaTypeTreeEventStore,
  ) {}

  async execute(): Promise<{ id: number }> {
    const tree = await this.mediaTypeTreeRepo.get()

    const event = tree.addMediaType()

    await this.eventStore.save(event)

    return { id: event.id }
  }
}
