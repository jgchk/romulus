import type { IMediaTypeTreeRepository } from '../domain/repository'

export class AddMediaTypeCommand {
  constructor(private mediaTypeTreeRepo: IMediaTypeTreeRepository) {}

  async execute(): Promise<{ id: number }> {
    const tree = await this.mediaTypeTreeRepo.get()

    const event = tree.addMediaType()

    await this.mediaTypeTreeRepo.save(tree)

    return { id: event.id }
  }
}
