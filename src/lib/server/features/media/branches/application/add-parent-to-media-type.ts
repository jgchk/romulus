import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

export class AddParentToMediaTypeCommand {
  constructor(
    public readonly branchId: string,
    public readonly childMediaTypeId: string,
    public readonly parentMediaTypeId: string,
  ) {}
}

export class AddParentToMediaTypeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async execute(command: AddParentToMediaTypeCommand) {
    const tree = await this.repo.get(command.branchId)

    const error = tree.addParentToMediaType(command.childMediaTypeId, command.parentMediaTypeId)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.branchId, tree)
  }
}
