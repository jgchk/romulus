import type { IMediaTypeBranchesRepository } from '../domain/branches/repository'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

export class MergeBranchesCommand {
  constructor(
    public readonly sourceBranchId: string,
    public readonly targetBranchId: string,
  ) {}
}

export class MergeBranchesCommandHandler {
  constructor(
    private branchesRepo: IMediaTypeBranchesRepository,
    private treeRepo: IMediaTypeTreeRepository,
  ) {}

  async handle(command: MergeBranchesCommand) {
    const branches = await this.branchesRepo.get()

    const commonAncestor = branches.getCommonAncestor(
      command.sourceBranchId,
      command.targetBranchId,
    )

    const baseTree =
      commonAncestor === undefined ? undefined : await this.treeRepo.get(commonAncestor)
    const sourceTree = await this.treeRepo.get(command.sourceBranchId)
    const targetTree = await this.treeRepo.get(command.targetBranchId)

    const error = targetTree.merge(sourceTree, baseTree)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(command.targetBranchId, targetTree)
  }
}
