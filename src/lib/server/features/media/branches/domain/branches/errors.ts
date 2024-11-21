import { CustomError } from '$lib/utils/error'

export class MediaTypeBranchAlreadyExistsError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeBranchAlreadyExistsError', `Media type branch already exists with id: ${id}`)
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

export class MediaTypeBranchNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeBranchNotFoundError', `Media type branch not found with id: ${id}`)
  }
}
