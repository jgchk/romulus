import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import type { MediaTypeTreesRole } from '../domain/roles'
import { PermissionChecker } from '../domain/tree/permissions'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

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
    if (!tree.isCreated()) {
      return new MediaTypeTreeNotFoundError(command.treeId)
    }

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
