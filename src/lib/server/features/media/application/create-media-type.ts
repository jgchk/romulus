import type { IEventStore } from '../domain/event-store/event-store'
import type { IIdGenerator } from '../domain/ids/id-generator'
import { AddMediaTypeToTreeEvent } from '../domain/media-type-tree/events/add-media-type-to-tree'
import type { IMediaTypeTreeRepository } from '../domain/media-type-tree/repository'
import { MediaTypeAlreadyExistsError } from '../domain/media-type-tree/tree'

export class CreateMediaTypeCommand {
  constructor(
    private mediaTypeTreeRepo: IMediaTypeTreeRepository,
    private idGenerator: IIdGenerator,
    private eventStore: IEventStore,
  ) {}

  async execute(): Promise<{ id: number }> {
    const tree = await this.mediaTypeTreeRepo.get()
    const id = await this.idGenerator.generate()

    const event = new AddMediaTypeToTreeEvent(id)
    const result = event.process(tree)

    if (result instanceof MediaTypeAlreadyExistsError) {
      // This should never happen given that we genrate our own ids.
      // If we wanted to, we could regenerate a new id and try the event again.
      throw result
    }

    await this.eventStore.save(event)

    return { id }
  }
}
