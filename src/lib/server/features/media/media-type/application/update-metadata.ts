import { CustomError } from '$lib/utils/error'

import type { IMediaTypeEventStore } from '../domain/event-store'
import type { IMediaTypeRepository } from '../domain/repository'

export class UpdateMediaTypeMetadataCommand {
  constructor(
    private mediaTypeRepo: IMediaTypeRepository,
    private eventStore: IMediaTypeEventStore,
  ) {}

  async execute(
    id: number,
    name: string,
    description: string,
    notes: string,
  ): Promise<void | MediaTypeNotFoundError> {
    const mediaType = await this.mediaTypeRepo.get(id)
    if (!mediaType) {
      return new MediaTypeNotFoundError(id)
    }

    const event = mediaType.updateMetadata(name, description, notes)

    await this.eventStore.save(event)
  }
}

export class MediaTypeNotFoundError extends CustomError {
  constructor(public readonly id: number) {
    super('MediaTypeNotFoundError', `A media type was not found for id: ${id}`)
  }
}
