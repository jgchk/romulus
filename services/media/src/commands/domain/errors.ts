import { CustomError } from '@romulus/custom-error'

export class MediaTypeTreeNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeTreeNotFoundError', `Media type tree not found with id: ${id}`)
  }
}

export class UnauthorizedError extends CustomError {
  constructor() {
    super('UnauthorizedError', 'You are not authorized to perform this action')
  }
}

export class MediaTypeTreeAlreadyExistsError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeTreeAlreadyExistsError', `Media type tree already exists with id: ${id}`)
  }
}

export class MediaTypeTreeNameInvalidError extends CustomError {
  constructor(public readonly treeName: string) {
    super(
      'MediaTypeTreeNameInvalidError',
      `Media type tree name must contain at least one non-whitespace character: "${treeName}"`,
    )
  }
}

export class MediaTypeAlreadyExistsError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeAlreadyExistsError', `Media type already exists with id: ${id}`)
  }
}

export class MediaTypeNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeNotFoundError', `Media type not found with id: ${id}`)
  }
}

export class MediaTypeNameInvalidError extends CustomError {
  constructor(public readonly mediaTypeName: string) {
    super(
      'MediaTypeNameInvalidError',
      `Media type name must contain at least one non-whitespace character: "${mediaTypeName}"`,
    )
  }
}

export class WillCreateCycleError extends CustomError {
  constructor(public readonly cycle: string[]) {
    super(
      'WillCreateCycleError',
      `Performing this operation will create a cycle in the media type tree: ${cycle.join(' -> ')}`,
    )
  }
}

export class MediaTypeMergeRequestNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeMergeRequestNotFound', `Media type merge request not found with id: ${id}`)
  }
}
