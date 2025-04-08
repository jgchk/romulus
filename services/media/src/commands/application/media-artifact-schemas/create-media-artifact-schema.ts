import { err, ok, type Result } from 'neverthrow'

import type { MediaArtifactSchemaCreatedEvent } from '../../../common/domain/events.js'
import type { MaybePromise } from '../../../utils.js'
import * as domain from '../../domain/media-artifact-schemas/create-media-artifact-schema.js'
import type { MediaArtifactSchemaNotFoundError } from '../../domain/media-artifact-schemas/errors.js'
import type { MediaArtifactSchemasProjection } from '../../domain/media-artifact-schemas/media-artifact-schema-projection.js'
import type { MediaTypeNotFoundError } from '../../domain/media-types/errors.js'
import { type MediaTypesProjection } from '../../domain/media-types/media-types-projection.js'

export type CreateMediaArtifactSchemaCommandHandler = (
  command: domain.CreateMediaArtifactSchemaCommand,
) => Promise<Result<void, MediaTypeNotFoundError | MediaArtifactSchemaNotFoundError>>

export function createCreateMediaArtifactSchemaCommandHandler({
  getMediaTypes,
  getMediaArtifactSchemas,
  saveMediaArtifactSchemaEvent,
}: {
  getMediaTypes: () => MaybePromise<MediaTypesProjection>
  getMediaArtifactSchemas: (mediaType: string) => MaybePromise<MediaArtifactSchemasProjection>
  saveMediaArtifactSchemaEvent: (
    mediaType: string,
    event: MediaArtifactSchemaCreatedEvent,
  ) => MaybePromise<void>
}): CreateMediaArtifactSchemaCommandHandler {
  return async function (command) {
    const createMediaArtifactSchema = domain.createCreateMediaArtifactSchemaCommandHandler(
      await getMediaTypes(),
      await getMediaArtifactSchemas(command.mediaType),
    )

    const result = createMediaArtifactSchema(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveMediaArtifactSchemaEvent(command.mediaType, result.value)

    return ok(undefined)
  }
}
