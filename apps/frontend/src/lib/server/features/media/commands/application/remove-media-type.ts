import { UnauthorizedError } from '../domain/errors'
import { PermissionChecker } from '../domain/permissions'
import type { IMediaTypeTreeRepository } from '../domain/repository'
import type { MediaTypeTreesRole } from '../domain/roles'

export class RemoveMediaTypeCommand {
  constructor(
    public readonly treeId: string,
    public readonly mediaTypeId: string,
    public readonly userId: number,
    public readonly roles: Set<MediaTypeTreesRole>,
  ) {}
}

export class RemoveMediaTypeCommandHandler {
  constructor(private treeRepo: IMediaTypeTreeRepository) {}

  async handle(command: RemoveMediaTypeCommand) {
    const tree = await this.treeRepo.get(command.treeId)

    const hasPermission = PermissionChecker.canModifyTree(
      command.roles,
      tree.isOwner(command.userId),
      tree.isMainTree(),
    )
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const error = tree.removeMediaType(command.mediaTypeId)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(tree)
  }
}
