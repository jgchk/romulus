import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import type { MediaTypeTreePermission } from '../domain/roles'
import { PermissionChecker } from '../domain/tree/permissions'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

export class MergeTreesCommand {
  constructor(
    public readonly sourceTreeId: string,
    public readonly targetTreeId: string,
    public readonly userId: number,
    public readonly permissions: Set<MediaTypeTreePermission>,
  ) {}
}

export class MergeTreesCommandHandler {
  constructor(private treeRepo: IMediaTypeTreeRepository) {}

  async handle(command: MergeTreesCommand) {
    const sourceTree = await this.treeRepo.get(command.sourceTreeId)
    if (sourceTree instanceof MediaTypeTreeNotFoundError) {
      return sourceTree
    }

    const targetTree = await this.treeRepo.get(command.targetTreeId)
    if (targetTree instanceof MediaTypeTreeNotFoundError) {
      return targetTree
    }

    const hasPermission = PermissionChecker.canModifyTree(
      command.permissions,
      targetTree.isOwner(command.userId),
    )
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const lastCommonCommit = sourceTree.getLastCommonCommit(targetTree)
    const baseTree = await this.treeRepo.getToCommit(command.sourceTreeId, lastCommonCommit)
    if (baseTree instanceof MediaTypeTreeNotFoundError) {
      return baseTree
    }

    const error = targetTree.merge(sourceTree, baseTree)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(command.targetTreeId, targetTree)
  }
}
