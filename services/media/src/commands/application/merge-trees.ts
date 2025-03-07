import { UnauthorizedError } from '../domain/errors.js'
import { PermissionChecker } from '../domain/permissions.js'
import type { IMediaTypeTreeRepository } from '../domain/repository.js'
import type { MediaTypeTreesRole } from '../domain/roles.js'

export class MergeTreesCommand {
  constructor(
    public readonly sourceTreeId: string,
    public readonly targetTreeId: string,
    public readonly userId: number,
    public readonly roles: Set<MediaTypeTreesRole>,
  ) {}
}

export class MergeTreesCommandHandler {
  constructor(private treeRepo: IMediaTypeTreeRepository) {}

  async handle(command: MergeTreesCommand) {
    const tree = await this.treeRepo.get(command.targetTreeId)

    const hasPermission = PermissionChecker.canModifyTree(
      command.roles,
      tree.isOwner(command.userId),
      tree.isMainTree(),
    )
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const error = tree.merge(command.sourceTreeId)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(tree)
  }
}
