import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import {
  type MediaArtifactTypeCreatedEvent,
  mediaArtifactTypeCreatedEvent,
} from '../../../common/domain/events.js'
import type { MediaArtifactType } from '../../../common/domain/types.js'
import { MediaTypeNotFoundError } from '../media-types/errors.js'
import type { MediaTypesProjection } from '../media-types/media-types-projection.js'
import type { MediaArtifactTypeNotFoundError } from './errors.js'

export function createCreateMediaArtifactTypeCommandHandler(
  mediaTypesProjection: MediaTypesProjection,
) {
  function doesMediaTypeExist(mediaType: string) {
    return mediaTypesProjection.mediaTypes.has(mediaType)
  }

  return function createMediaArtifactType(
    command: CreateMediaArtifactTypeCommand,
  ): Result<
    MediaArtifactTypeCreatedEvent,
    MediaTypeNotFoundError | MediaArtifactTypeNotFoundError
  > {
    const mediaTypeExists = doesMediaTypeExist(command.mediaType)
    if (!mediaTypeExists) {
      return err(new MediaTypeNotFoundError(command.mediaType))
    }

    return ok(
      mediaArtifactTypeCreatedEvent({
        mediaType: command.mediaType,
        mediaArtifactType: command.mediaArtifactType,
      }),
    )
  }
}

export type CreateMediaArtifactTypeCommand = {
  mediaType: string
  mediaArtifactType: MediaArtifactType
}
