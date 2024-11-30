import { MediaTypeTreeNotFoundError, UnauthorizedError } from '../domain/errors'
import type { MediaTypeTreesRole } from '../domain/roles'
import { PermissionChecker } from '../domain/tree/permissions'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

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
    const sourceTree = await this.treeRepo.get(command.sourceTreeId)
    if (!sourceTree.isCreated()) {
      return new MediaTypeTreeNotFoundError(command.sourceTreeId)
    }

    const targetTree = await this.treeRepo.get(command.targetTreeId)
    if (!targetTree.isCreated()) {
      return new MediaTypeTreeNotFoundError(command.targetTreeId)
    }

    const hasPermission = PermissionChecker.canModifyTree(
      command.roles,
      targetTree.isOwner(command.userId),
      targetTree.isMainTree(),
    )
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const error = targetTree.merge(command.sourceTreeId)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(targetTree)
  }
}
