import { UnauthorizedError } from '../domain/errors'
import { type MediaTypeTreesRole } from '../domain/roles'
import { MediaTypeTreeAlreadyExistsError } from '../domain/tree/errors'
import { PermissionChecker } from '../domain/tree/permissions'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'
import { MediaTypeTree } from '../domain/tree/tree'

export class CreateTreeCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly userId: number,
    public readonly roles: Set<MediaTypeTreesRole>,
  ) {}
}

export class CreateTreeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: CreateTreeCommand) {
    const hasPermission = PermissionChecker.canCreateTree(command.roles)
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const existingTree = await this.repo.get(command.id)
    if (existingTree.isCreated()) {
      return new MediaTypeTreeAlreadyExistsError(command.id)
    }

    const tree = MediaTypeTree.fromEvents(command.id, [])

    const error = tree.create(command.name, undefined, command.userId)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(tree)
  }
}
