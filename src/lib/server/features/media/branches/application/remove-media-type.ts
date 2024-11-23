import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

export class RemoveMediaTypeCommand {
  constructor(
    public readonly branchId: string,
    public readonly mediaTypeId: string,
  ) {}
}

export class RemoveMediaTypeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: RemoveMediaTypeCommand) {
    const tree = await this.repo.get(command.branchId)

    const error = tree.removeMediaType(command.mediaTypeId)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.branchId, tree)
  }
}
