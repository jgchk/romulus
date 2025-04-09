import { CustomError } from '@romulus/custom-error'

export class MediaArtifactTypeNotFoundError extends CustomError<'MediaArtifactTypeNotFound'> {
  constructor(public readonly id: string) {
    super('MediaArtifactTypeNotFound', `Media artifact type with ID '${id}' not found`)
  }
}
