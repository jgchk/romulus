import { MediaTypeTreeNotFoundError, UnauthorizedError } from '../domain/errors'
import { MediaTypeTreePermission } from '../domain/permissions'
import type { IMediaTypeTreeRepository } from '../domain/repository'

export class RemoveMediaTypeCommand {
  constructor(
    public readonly treeId: string,
    public readonly mediaTypeId: string,
    public readonly userId: number,
    public readonly permissions: Set<MediaTypeTreePermission>,
  ) {}
}

export class RemoveMediaTypeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: RemoveMediaTypeCommand) {
    const tree = await this.repo.get(command.treeId)
    if (tree instanceof MediaTypeTreeNotFoundError) {
      return tree
    }

    const hasPermission =
      command.permissions.has(MediaTypeTreePermission.ADMIN) ||
      (command.permissions.has(MediaTypeTreePermission.WRITE) && tree.isOwner(command.userId))
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const error = tree.removeMediaType(command.mediaTypeId)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.treeId, tree)
  }
}
