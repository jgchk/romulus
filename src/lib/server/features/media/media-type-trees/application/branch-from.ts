import type { IMediaTypeTreeRepository } from '../domain/repository'

export class BranchFromCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly baseBranchId: string,
  ) {}
}

export class BranchFromCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: BranchFromCommand) {
    const tree = await this.repo.copy(command.baseBranchId)

    const error = tree.setName(command.name)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.id, tree)
  }
}
