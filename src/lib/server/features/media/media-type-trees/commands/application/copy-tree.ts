import { MediaTypeTreeAlreadyExistsError, MediaTypeTreeNotFoundError } from '../domain/errors'
import type { IMediaTypeTreeRepository } from '../domain/repository'

export class CopyTreeCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly baseTreeId: string,
    public readonly userId: number,
  ) {}
}

export class CopyTreeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: CopyTreeCommand) {
    // allow when:
    // - you have media-type-trees:admin permission
    // - you have media-type-trees:write permission

    if (await this.repo.has(command.id)) {
      return new MediaTypeTreeAlreadyExistsError(command.id)
    }

    const tree = await this.repo.copy(command.baseTreeId)
    if (tree instanceof MediaTypeTreeNotFoundError) {
      return tree
    }

    const error = tree.create(command.name, command.userId)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.id, tree)
  }
}
