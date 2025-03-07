import type { MediaTypeTreeNotFoundError } from '../domain/errors.js'
import { UnauthorizedError } from '../domain/errors.js'
import type { IMediaTypeTreeRepository } from '../domain/repository.js'
import { MediaTypeTreesRole } from '../domain/roles.js'

export class SetMainTreeCommand {
  constructor(
    public readonly mainTreeId: string,
    public readonly userId: number,
    public readonly roles: Set<MediaTypeTreesRole>,
  ) {}
}

export class SetMainTreeCommandHandler {
  constructor(private readonly treeRepo: IMediaTypeTreeRepository) {}

  async handle(
    command: SetMainTreeCommand,
  ): Promise<void | MediaTypeTreeNotFoundError | UnauthorizedError> {
    const hasPermission = command.roles.has(MediaTypeTreesRole.ADMIN)
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const existingTree = await this.treeRepo.get(command.mainTreeId)

    const error = existingTree.setMainTree(command.userId)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(existingTree)
  }
}
