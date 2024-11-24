import type { IMediaTypeTreeRepository } from '../domain/repository'

export class CopyTreeCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly baseTreeId: string,
  ) {}
}

export class CopyTreeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: CopyTreeCommand) {
    // allow when:
    // - you have media-type-trees:admin permission
    // - you have media-type-trees:write permission

    const tree = await this.repo.copy(command.baseTreeId)

    const error = tree.setName(command.name)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.id, tree)
  }
}
