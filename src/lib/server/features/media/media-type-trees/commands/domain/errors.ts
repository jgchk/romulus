import { CustomError } from '$lib/utils/error'

export class MediaTypeTreeNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeTreeNotFoundError', `Media type tree not found with id: ${id}`)
  }
}

export class MediaTypeTreeNameInvalidError extends CustomError {
  constructor(public readonly name: string) {
    super(
      'MediaTypeTreeNameInvalidError',
      `Media type tree name must contain at least one non-whitespace character: "${name}"`,
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
  constructor(public readonly name: string) {
    super(
      'MediaTypeNameInvalidError',
      `Media type name must contain at least one non-whitespace character: "${name}"`,
    )
  }
}

export class WillCreateCycleError extends CustomError {
  constructor(public readonly cycle: string[]) {
    super(
      'WillCreateCycleInMediaTypeTreeError',
      `Performing this operation will create a cycle in the media type tree: ${cycle.join(' -> ')}`,
    )
  }
}
