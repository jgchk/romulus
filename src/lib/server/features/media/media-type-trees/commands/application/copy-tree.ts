import { UnauthorizedError } from '../domain/errors'
import { PermissionChecker } from '../domain/permissions'
import type { IMediaTypeTreeRepository } from '../domain/repository'
import type { MediaTypeTreesRole } from '../domain/roles'

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

    const tree = await this.repo.get(command.id)

    const error = tree.create(command.name, command.baseTreeId, command.userId)
    if (error instanceof Error) {
      return error
    }

    await this.repo.save(tree)
  }
}
