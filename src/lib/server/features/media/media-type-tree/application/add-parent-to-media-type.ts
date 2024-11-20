import type { IMediaTypeTreeRepository } from '../domain/repository'
import type { CycleError, MediaTypeNotFoundError } from '../../media-type-branches/domain/tree'

export class AddParentToMediaTypeCommand {
  constructor(private mediaTypeTreeRepo: IMediaTypeTreeRepository) {}

  async execute(id: number, parentId: number): Promise<void | MediaTypeNotFoundError | CycleError> {
    const tree = await this.mediaTypeTreeRepo.get()

    const event = tree.addParentToMediaType(id, parentId)
    if (event instanceof Error) {
      return event
    }

    await this.mediaTypeTreeRepo.save(tree)
  }
}
