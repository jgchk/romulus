import { MediaTypeTreeAlreadyExistsError } from '../domain/tree/errors'
import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import type { MediaTypeTreePermission } from '../domain/roles'
import { PermissionChecker } from '../domain/tree/permissions'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'

export class CopyTreeCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly baseTreeId: string,
    public readonly userId: number,
    public readonly permissions: Set<MediaTypeTreePermission>,
  ) {}
}

export class CopyTreeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: CopyTreeCommand) {
    const hasPermission = PermissionChecker.canCreateTree(command.permissions)
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    if (await this.repo.has(command.id)) {
      return new MediaTypeTreeAlreadyExistsError(command.id)
    }

    const tree = await this.repo.copy(command.baseTreeId)
    if (tree instanceof MediaTypeTreeNotFoundError) {
      return tree
    }

    const error = tree.create(command.name, command.userId)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.id, tree)
  }
}
