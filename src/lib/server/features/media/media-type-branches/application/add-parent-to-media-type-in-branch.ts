import type {
  MediaTypeBranchNotFoundError,
  MediaTypeNotFoundInBranchError,
  WillCreateCycleInMediaTypeTreeError,
} from '../domain/errors'
import type { IMediaTypeBranchesRepository } from '../domain/repository'

export class AddParentToMediaTypeInBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly childMediaTypeId: string,
    public readonly parentMediaTypeId: string,
  ) {}
}

export class AddParentToMediaTypeInBranchCommandHandler {
  constructor(private repo: IMediaTypeBranchesRepository) {}

  async execute(
    command: AddParentToMediaTypeInBranchCommand,
  ): Promise<
    | void
    | MediaTypeBranchNotFoundError
    | MediaTypeNotFoundInBranchError
    | WillCreateCycleInMediaTypeTreeError
  > {
    const branches = await this.repo.get()

    const result = branches.addParentToMediaTypeInBranch(
      command.branchId,
      command.childMediaTypeId,
      command.parentMediaTypeId,
    )
    if (result instanceof Error) {
      return result
    }

    await this.repo.save(branches)
  }
}
