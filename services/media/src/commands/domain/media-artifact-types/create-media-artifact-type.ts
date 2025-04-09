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
    for (const mediaType of command.mediaArtifactType.mediaTypes) {
      if (!doesMediaTypeExist(mediaType)) {
        return err(new MediaTypeNotFoundError(mediaType))
      }
    }

    return ok(
      mediaArtifactTypeCreatedEvent({
        mediaArtifactType: command.mediaArtifactType,
      }),
    )
  }
}

export type CreateMediaArtifactTypeCommand = {
  mediaArtifactType: MediaArtifactType
}
