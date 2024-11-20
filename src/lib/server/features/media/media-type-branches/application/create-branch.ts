import type { IMediaTypeBranchesRepository } from '../domain/repository'

export class CreateBranchCommand {
  constructor(public readonly branchId: string) {}
}

export class CreateBranchCommandHandler {
  constructor(private readonly repo: IMediaTypeBranchesRepository) {}

  async handle(command: CreateBranchCommand) {
    const branches = await this.repo.get()

    const result = branches.createBranch(command.branchId)
    if (result instanceof Error) {
      return result
    }

    await this.repo.save(branches)
  }
}
