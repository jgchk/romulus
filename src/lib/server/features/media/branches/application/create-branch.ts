import type { IMediaTypeTreeRepository } from '../domain/repository'
import { MediaTypeTree } from '../domain/tree'

export class CreateBranchCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}

export class CreateBranchCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: CreateBranchCommand) {
    const tree = MediaTypeTree.fromEvents([])

    const error = tree.setName(command.name)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.id, tree)
  }
}
