import type {
  MediaTypeAlreadyExistsInBranchError,
  MediaTypeBranchNotFoundError,
  MediaTypeNameInvalidError,
} from '../domain/errors'
import type { IMediaTypeBranchesRepository } from '../domain/repository'

export class AddMediaTypeToBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly mediaTypeId: string,
    public readonly mediaTypeName: string,
  ) {}
}

export class AddMediaTypeToBranchCommandHandler {
  constructor(private repo: IMediaTypeBranchesRepository) {}

  async execute(
    command: AddMediaTypeToBranchCommand,
  ): Promise<
    | void
    | MediaTypeBranchNotFoundError
    | MediaTypeNameInvalidError
    | MediaTypeAlreadyExistsInBranchError
  > {
    const branches = await this.repo.get()

    const result = branches.addMediaTypeToBranch(
      command.branchId,
      command.mediaTypeId,
      command.mediaTypeName,
    )
    if (result instanceof Error) {
      return result
    }

    await this.repo.save(branches)
  }
}
