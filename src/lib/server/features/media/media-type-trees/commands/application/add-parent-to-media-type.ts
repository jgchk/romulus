import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import type { IMainTreeManagerRepository } from '../domain/main-tree-manager/repository'
import { type MediaTypeTreesRole } from '../domain/roles'
import { PermissionChecker } from '../domain/tree/permissions'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

export class AddParentToMediaTypeCommand {
  constructor(
    public readonly treeId: string,
    public readonly childMediaTypeId: string,
    public readonly parentMediaTypeId: string,
    public readonly userId: number,
    public readonly roles: Set<MediaTypeTreesRole>,
  ) {}
}

export class AddParentToMediaTypeCommandHandler {
  constructor(
    private treeRepo: IMediaTypeTreeRepository,
    private mainTreeRepo: IMainTreeManagerRepository,
  ) {}

  async handle(command: AddParentToMediaTypeCommand) {
    const tree = await this.treeRepo.get(command.treeId)
    if (tree instanceof MediaTypeTreeNotFoundError) {
      return tree
    }

    const mainTreeManager = await this.mainTreeRepo.get()

    const hasPermission = PermissionChecker.canModifyTree(
      command.roles,
      tree.isOwner(command.userId),
      mainTreeManager.isMainTree(command.treeId),
    )
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const error = tree.addParentToMediaType(command.childMediaTypeId, command.parentMediaTypeId)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(command.treeId, tree)
  }
}
