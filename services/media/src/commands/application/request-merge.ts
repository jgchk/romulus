import { UnauthorizedError } from '../domain/errors.js'
import { PermissionChecker } from '../domain/permissions.js'
import type { IMediaTypeTreeRepository } from '../domain/repository.js'
import type { MediaTypeTreesRole } from '../domain/roles.js'

export class RequestMergeTreesCommand {
  constructor(
    public readonly mergeRequestId: string,
    public readonly sourceTreeId: string,
    public readonly targetTreeId: string,
    public readonly userId: number,
    public readonly roles: Set<MediaTypeTreesRole>,
  ) {}
}

export class RequestMergeTreesCommandHandler {
  constructor(private treeRepo: IMediaTypeTreeRepository) {}

  async handle(command: RequestMergeTreesCommand) {
    const tree = await this.treeRepo.get(command.targetTreeId)

    const hasPermission = PermissionChecker.canRequestMerge(command.roles)
    if (!hasPermission) {
      return new UnauthorizedError()
    }

    const error = tree.requestMerge(command.mergeRequestId, command.sourceTreeId, command.userId)
    if (error instanceof Error) {
      return error
    }

    await this.treeRepo.save(tree)
  }
}
