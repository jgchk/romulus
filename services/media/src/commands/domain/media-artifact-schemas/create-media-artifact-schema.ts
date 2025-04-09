import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import {
  type MediaArtifactSchemaCreatedEvent,
  mediaArtifactSchemaCreatedEvent,
} from '../../../common/domain/events.js'
import type { MediaArtifactSchema } from '../../../common/domain/types.js'
import { MediaTypeNotFoundError } from '../media-types/errors.js'
import type { MediaTypesProjection } from '../media-types/media-types-projection.js'
import type { MediaArtifactSchemaNotFoundError } from './errors.js'

export function createCreateMediaArtifactSchemaCommandHandler(
  mediaTypesProjection: MediaTypesProjection,
) {
  function doesMediaTypeExist(mediaType: string) {
    return mediaTypesProjection.mediaTypes.has(mediaType)
  }

  return function createMediaArtifactSchema(
    command: CreateMediaArtifactSchemaCommand,
  ): Result<
    MediaArtifactSchemaCreatedEvent,
    MediaTypeNotFoundError | MediaArtifactSchemaNotFoundError
  > {
    const mediaTypeExists = doesMediaTypeExist(command.mediaType)
    if (!mediaTypeExists) {
      return err(new MediaTypeNotFoundError(command.mediaType))
    }

    return ok(
      mediaArtifactSchemaCreatedEvent({ mediaType: command.mediaType, schema: command.schema }),
    )
  }
}

export type CreateMediaArtifactSchemaCommand = {
  mediaType: string
  schema: MediaArtifactSchema
}
