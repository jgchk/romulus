import { UnauthorizedError } from '../domain/errors.js'
import { PermissionChecker } from '../domain/permissions.js'
import type { IMediaTypeTreeRepository } from '../domain/repository.js'
import type { MediaTypeTreesRole } from '../domain/roles.js'

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
  constructor(private treeRepo: IMediaTypeTreeRepository) {}

  async handle(command: AddMediaTypeCommand) {
    const tree = await this.treeRepo.get(command.treeId)

    const hasPermission = PermissionChecker.canModifyTree(
      command.roles,
      tree.isOwner(command.userId),
      tree.isMainTree(),
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
