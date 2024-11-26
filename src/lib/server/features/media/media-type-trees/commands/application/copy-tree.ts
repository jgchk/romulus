import { MediaTypeTreeNotFoundError, UnauthorizedError } from '../domain/errors'
import type { MediaTypeTreesRole } from '../domain/roles'
import { MediaTypeTreeAlreadyExistsError } from '../domain/tree/errors'
import { PermissionChecker } from '../domain/tree/permissions'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'
import { MediaTypeTree } from '../domain/tree/tree'

export class CopyTreeCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly baseTreeId: string,
    public readonly userId: number,
    public readonly roles: Set<MediaTypeTreesRole>,
  ) {}
}

export class CopyTreeCommandHandler {
  constructor(private repo: IMediaTypeTreeRepository) {}

  async handle(command: CopyTreeCommand) {
    const hasPermission = PermissionChecker.canCreateTree(command.roles)
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const existingTree = await this.repo.get(command.id)
    if (existingTree.isCreated()) {
      return new MediaTypeTreeAlreadyExistsError(command.id)
    }

    const baseTree = await this.repo.get(command.baseTreeId)
    if (!baseTree.isCreated()) {
      return new MediaTypeTreeNotFoundError(command.baseTreeId)
    }

    const tree = MediaTypeTree.fromEvents(command.id, [])

    const error = tree.create(command.name, command.baseTreeId, command.userId)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(tree)
  }
}
