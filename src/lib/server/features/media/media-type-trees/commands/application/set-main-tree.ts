import { MediaTypeTreeNotFoundError, UnauthorizedError } from '../domain/errors'
import type { IMainTreeManagerRepository } from '../domain/main-tree-manager/repository'
import { MediaTypeTreesRole } from '../domain/roles'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

export class SetMainTreeCommand {
  constructor(
    public readonly mainTreeId: string,
    public readonly userId: number,
    public readonly roles: Set<MediaTypeTreesRole>,
  ) {}
}

export class SetMainTreeCommandHandler {
  constructor(
    private readonly mainTreeRepo: IMainTreeManagerRepository,
    private readonly treeRepo: IMediaTypeTreeRepository,
  ) {}

  async handle(
    command: SetMainTreeCommand,
  ): Promise<void | MediaTypeTreeNotFoundError | UnauthorizedError> {
    const hasPermission = command.roles.has(MediaTypeTreesRole.ADMIN)
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const existingTree = await this.treeRepo.get(command.mainTreeId)
    if (!existingTree.isCreated()) {
      return new MediaTypeTreeNotFoundError(command.mainTreeId)
    }

    const manager = await this.mainTreeRepo.get()
    manager.setMainTree(command.mainTreeId, command.userId)
    await this.mainTreeRepo.save(manager)
  }
}
