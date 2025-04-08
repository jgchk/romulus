import { CustomError } from '@romulus/custom-error'

export class MediaArtifactSchemaNotFoundError extends CustomError<'MediaArtifactSchemaNotFound'> {
  constructor(public readonly id: string) {
    super('MediaArtifactSchemaNotFound', `Media artifact schema with ID '${id}' not found`)
  }
}
