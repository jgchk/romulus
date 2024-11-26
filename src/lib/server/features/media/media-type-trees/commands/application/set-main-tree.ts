import { MediaTypeTreeNotFoundError, UnauthorizedError } from '../domain/errors'
import type { IMainTreeManagerRepository } from '../domain/main-tree-manager/repository'
import { MediaTypeTreePermission } from '../domain/roles'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

export class SetMainTreeCommand {
  constructor(
    public readonly mainTreeId: string,
    public readonly userId: number,
    public readonly roles: Set<MediaTypeTreePermission>,
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
    const hasPermission = command.roles.has(MediaTypeTreePermission.ADMIN)
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const treeExists = await this.treeRepo.has(command.mainTreeId)
    if (!treeExists) {
      return new MediaTypeTreeNotFoundError(command.mainTreeId)
    }

    const manager = await this.mainTreeRepo.get()
    manager.setMainTree(command.mainTreeId, command.userId)
    await this.mainTreeRepo.save(manager)
  }
}
