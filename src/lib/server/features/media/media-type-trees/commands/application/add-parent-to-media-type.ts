import type { IMediaTypeTreeRepository } from '../domain/repository'

export class AddParentToMediaTypeCommand {
  constructor(
    public readonly treeId: string,
    public readonly childMediaTypeId: string,
    public readonly parentMediaTypeId: string,
  ) {}
}

export class AddParentToMediaTypeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: AddParentToMediaTypeCommand) {
    // allow when:
    // - you have media-type-trees:admin permission
    // - you have media-type-trees:write permission & you are the owner of the tree

    const tree = await this.repo.get(command.treeId)

    const error = tree.addParentToMediaType(command.childMediaTypeId, command.parentMediaTypeId)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.treeId, tree)
  }
}
