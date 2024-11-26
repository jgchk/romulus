import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import { type MediaTypeTreePermission } from '../domain/roles'
import { PermissionChecker } from '../domain/tree/permissions'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

export class AddParentToMediaTypeCommand {
  constructor(
    public readonly treeId: string,
    public readonly childMediaTypeId: string,
    public readonly parentMediaTypeId: string,
    public readonly userId: number,
    public readonly permissions: Set<MediaTypeTreePermission>,
  ) {}
}

export class AddParentToMediaTypeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: AddParentToMediaTypeCommand) {
    const tree = await this.repo.get(command.treeId)
    if (tree instanceof MediaTypeTreeNotFoundError) {
      return tree
    }

    const hasPermission = PermissionChecker.canModifyTree(
      command.permissions,
      tree.isOwner(command.userId),
    )
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const error = tree.addParentToMediaType(command.childMediaTypeId, command.parentMediaTypeId)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.treeId, tree)
  }
}
