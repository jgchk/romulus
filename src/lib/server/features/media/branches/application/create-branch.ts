import type { IMediaTypeBranchesRepository } from '../domain/branches/repository'

export class CreateBranchCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly baseBranchId: string | undefined,
  ) {}
}

export class CreateBranchCommandHandler {
  constructor(private repo: IMediaTypeBranchesRepository) {}

  async handle(command: CreateBranchCommand) {
    const branches = await this.repo.get()

    const result = branches.createBranch(command.id, command.name, command.baseBranchId)
    if (result instanceof Error) {
      return result
    }

    await this.repo.save(branches)
  }
}
