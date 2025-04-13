import { CustomError } from '@romulus/custom-error'

export class MediaArtifactTypeNotFoundError extends CustomError<'MediaArtifactTypeNotFoundError'> {
  constructor(public readonly id: string) {
    super('MediaArtifactTypeNotFoundError', `Media artifact type with ID '${id}' not found`)
  }
}

export class MediaArtifactRelationshipTypeNotFoundError extends CustomError<'MediaArtifactRelationshipTypeNotFoundError'> {
  constructor(public readonly id: string) {
    super(
      'MediaArtifactRelationshipTypeNotFoundError',
      `Media artifact relationship type with ID '${id}' not found`,
    )
  }
}
