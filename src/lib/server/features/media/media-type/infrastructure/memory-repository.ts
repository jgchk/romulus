import type { IMediaTypeEventStore } from '../domain/event-store'
import { MediaType } from '../domain/media-type'
import type { IMediaTypeRepository } from '../domain/repository'

export class MemoryMediaTypeRepository implements IMediaTypeRepository {
  constructor(private eventStore: IMediaTypeEventStore) {}

  async get(id: number) {
    const mediaType = new MediaType(id)

    const events = await this.eventStore.get()
    for (const event of events) {
      mediaType.apply(event)
    }

    return mediaType
  }
}
