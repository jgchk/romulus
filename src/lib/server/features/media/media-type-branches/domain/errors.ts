import { CustomError } from '$lib/utils/error'

export class MediaTypeBranchAlreadyExistsError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeBranchAlreadyExistsError', `Media type branch already exists with id: ${id}`)
  }
}

export class MediaTypeBranchNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeBranchNotFoundError', `Media type branch not found with id: ${id}`)
  }
}

export class MediaTypeAlreadyExistsInBranchError extends CustomError {
  constructor(
    public readonly branchId: string,
    public readonly mediaTypeId: string,
  ) {
    super(
      'MediaTypeAlreadyExistsError',
      `Media type ${mediaTypeId} already exists in branch ${branchId}`,
    )
  }
}

export class MediaTypeNotFoundInBranchError extends CustomError {
  constructor(
    public readonly branchId: string,
    public readonly mediaTypeId: string,
  ) {
    super(
      'MediaTypeNotFoundInBranchError',
      `Media type ${mediaTypeId} not found in branch ${branchId}`,
    )
  }
}

export class WillCreateCycleInMediaTypeTreeError extends CustomError {
  constructor(
    public readonly branchId: string,
    public readonly cycle: string[],
  ) {
    super(
      'WillCreateCycleInMediaTypeTreeError',
      `Performing this operation will create a cycle in the media type tree for branch ${branchId}: ${cycle.join(' -> ')}`,
    )
  }
}
