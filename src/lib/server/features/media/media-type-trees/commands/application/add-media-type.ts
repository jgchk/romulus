import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import type { IMainTreeManagerRepository } from '../domain/main-tree-manager/repository'
import type { MediaTypeTreesRole } from '../domain/roles'
import { PermissionChecker } from '../domain/tree/permissions'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

export class AddMediaTypeCommand {
  constructor(
    public readonly treeId: string,
    public readonly mediaTypeId: string,
    public readonly mediaTypeName: string,
    public readonly userId: number,
    public readonly roles: Set<MediaTypeTreesRole>,
  ) {}
}

export class AddMediaTypeCommandHandler {
  constructor(
    private treeRepo: IMediaTypeTreeRepository,
    private mainTreeRepo: IMainTreeManagerRepository,
  ) {}

  async handle(command: AddMediaTypeCommand) {
    const tree = await this.treeRepo.get(command.treeId)
    if (!tree.isCreated()) {
      return new MediaTypeTreeNotFoundError(command.treeId)
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

    const error = tree.addMediaType(command.mediaTypeId, command.mediaTypeName)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(tree)
  }
}
