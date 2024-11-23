import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

export class MergeBranchesCommand {
  constructor(
    public readonly sourceBranchId: string,
    public readonly targetBranchId: string,
  ) {}
}

export class MergeBranchesCommandHandler {
  constructor(private treeRepo: IMediaTypeTreeRepository) {}

  async handle(command: MergeBranchesCommand) {
    const sourceTree = await this.treeRepo.get(command.sourceBranchId)
    const targetTree = await this.treeRepo.get(command.targetBranchId)

    const commonCommits = sourceTree.getCommonCommits(targetTree)
    const lastCommonCommit = commonCommits.at(commonCommits.length - 1)
    const baseTree =
      lastCommonCommit === undefined
        ? undefined
        : await this.treeRepo.getToCommit(command.sourceBranchId, lastCommonCommit)

    const error = targetTree.merge(sourceTree, baseTree)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(command.targetBranchId, targetTree)
  }
}
