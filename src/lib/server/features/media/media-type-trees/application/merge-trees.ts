import type { IMediaTypeTreeRepository } from '../domain/repository'

export class MergeTreesCommand {
  constructor(
    public readonly sourceTreeId: string,
    public readonly targetTreeId: string,
  ) {}
}

export class MergeTreesCommandHandler {
  constructor(private treeRepo: IMediaTypeTreeRepository) {}

  async handle(command: MergeTreesCommand) {
    const sourceTree = await this.treeRepo.get(command.sourceTreeId)
    const targetTree = await this.treeRepo.get(command.targetTreeId)

    const commonCommits = sourceTree.getCommonCommits(targetTree)
    const lastCommonCommit = commonCommits.at(commonCommits.length - 1)
    const baseTree =
      lastCommonCommit === undefined
        ? undefined
        : await this.treeRepo.getToCommit(command.sourceTreeId, lastCommonCommit)

    const error = targetTree.merge(sourceTree, baseTree)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(command.targetTreeId, targetTree)
  }
}
