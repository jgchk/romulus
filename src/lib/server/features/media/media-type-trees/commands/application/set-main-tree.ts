import type { MediaTypeTreeNotFoundError } from '../domain/errors'
import { UnauthorizedError } from '../domain/errors'
import type { IMediaTypeTreeRepository } from '../domain/repository'
import { MediaTypeTreesRole } from '../domain/roles'

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
