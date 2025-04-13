import { CustomError } from '@romulus/custom-error'

export class MediaArtifactRelationshipTypeNotFoundError extends CustomError<'MediaArtifactRelationshipTypeNotFoundError'> {
  constructor(public readonly id: string) {
    super(
      'MediaArtifactRelationshipTypeNotFoundError',
      `Media artifact relationship type with ID '${id}' not found`,
    )
  }
}
