import type { IMediaTypeTreeRepository } from '../domain/repository'

export class AddMediaTypeCommand {
  constructor(
    public readonly branchId: string,
    public readonly mediaTypeId: string,
    public readonly mediaTypeName: string,
  ) {}
}

export class AddMediaTypeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: AddMediaTypeCommand) {
    const tree = await this.repo.get(command.branchId)

    const error = tree.addMediaType(command.mediaTypeId, command.mediaTypeName)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.branchId, tree)
  }
}
