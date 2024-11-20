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

export class MediaTypeBranchNameInvalidError extends CustomError {
  constructor(public readonly name: string) {
    super(
      'MediaTypeBranchNameInvalidError',
      `Branch name must contain at least one non-whitespace character: "${name}"`,
    )
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

export class MediaTypeNameInvalidError extends CustomError {
  constructor(public readonly name: string) {
    super(
      'MediaTypeNameInvalidError',
      `Media type name must contain at least one non-whitespace character: "${name}"`,
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
