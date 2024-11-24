import { MediaTypeTreeAlreadyExistsError } from '../domain/errors'
import type { IMediaTypeTreeRepository } from '../domain/repository'
import { MediaTypeTree } from '../domain/tree'

export class CreateTreeCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}

export class CreateTreeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: CreateTreeCommand) {
    // allow when:
    // - you have media-type-trees:admin permission
    // - you have media-type-trees:write permission

    if (await this.repo.has(command.id)) {
      return new MediaTypeTreeAlreadyExistsError(command.id)
    }

    const tree = MediaTypeTree.fromEvents([])

    const error = tree.setName(command.name)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.id, tree)
  }
}
