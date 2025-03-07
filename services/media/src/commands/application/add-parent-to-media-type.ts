import { UnauthorizedError } from '../domain/errors.js'
import { PermissionChecker } from '../domain/permissions.js'
import type { IMediaTypeTreeRepository } from '../domain/repository.js'
import { type MediaTypeTreesRole } from '../domain/roles.js'

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
  constructor(private treeRepo: IMediaTypeTreeRepository) {}

  async handle(command: AddParentToMediaTypeCommand) {
    const tree = await this.treeRepo.get(command.treeId)

    const hasPermission = PermissionChecker.canModifyTree(
      command.roles,
      tree.isOwner(command.userId),
      tree.isMainTree(),
    )
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const error = tree.addParentToMediaType(command.childMediaTypeId, command.parentMediaTypeId)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(tree)
  }
}
