import { CustomError } from '@romulus/custom-error'

export class MediaArtifactTypeNotFoundError extends CustomError<'MediaArtifactTypeNotFoundError'> {
  constructor(public readonly id: string) {
    super('MediaArtifactTypeNotFoundError', `Media artifact type with ID '${id}' not found`)
  }
}
