import { CustomError } from '@romulus/custom-error'

export class MediaTypeTreeCycleError extends CustomError<'MediaTypeTreeCycleError'> {
  constructor(public readonly cycle: string[]) {
    super(
      'MediaTypeTreeCycleError',
      `A cycle would be created in the media type tree: ${cycle.join(' -> ')}`,
    )
  }
}

export class MediaTypeNotFoundError extends CustomError<'MediaTypeNotFoundError'> {
  constructor(public readonly id: string) {
    super('MediaTypeNotFoundError', `Media type with ID '${id}' not found`)
  }
}
