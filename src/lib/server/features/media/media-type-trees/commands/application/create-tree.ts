import { UnauthorizedError } from '../domain/errors'
import { type MediaTypeTreePermission } from '../domain/roles'
import { MediaTypeTreeAlreadyExistsError } from '../domain/tree/errors'
import { PermissionChecker } from '../domain/tree/permissions'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'
import { MediaTypeTree } from '../domain/tree/tree'

export class CreateTreeCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly userId: number,
    public readonly permissions: Set<MediaTypeTreePermission>,
  ) {}
}

export class CreateTreeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: CreateTreeCommand) {
    const hasPermission = PermissionChecker.canCreateTree(command.permissions)
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    if (await this.repo.has(command.id)) {
      return new MediaTypeTreeAlreadyExistsError(command.id)
    }

    const tree = MediaTypeTree.fromEvents([])

    const error = tree.create(command.name, command.userId)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(command.id, tree)
  }
}
