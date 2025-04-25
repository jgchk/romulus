import { err, ok } from 'neverthrow'

import { mediaArtifactTypeUpdatedEvent } from '../../../common/domain/events.js'
import { type MediaArtifactType } from '../../../common/domain/types.js'
import { MediaTypeNotFoundError } from '../media-types/errors.js'
import { type MediaTypesProjection } from '../media-types/media-types-projection.js'
import { MediaArtifactTypeNotFoundError } from './errors.js'
import { type MediaArtifactTypesProjection } from './media-artifact-types-projection.js'

export function createUpdateMediaArtifactTypeCommandHandler({
  mediaTypes,
  mediaArtifactTypes,
}: {
  mediaTypes: MediaTypesProjection
  mediaArtifactTypes: MediaArtifactTypesProjection
}) {
  function doesMediaTypeExist(mediaType: string) {
    return mediaTypes.mediaTypes.has(mediaType)
  }

  function doesMediaArtifactTypeExist(mediaArtifactType: string) {
    return mediaArtifactTypes.types.has(mediaArtifactType)
  }

  return function updateMediaArtifactType(command: UpdateMediaArtifactTypeCommand) {
    if (!doesMediaArtifactTypeExist(command.id)) {
      return err(new MediaArtifactTypeNotFoundError(command.id))
    }

    for (const mediaType of command.update.mediaTypes) {
      if (!doesMediaTypeExist(mediaType)) {
        return err(new MediaTypeNotFoundError(mediaType))
      }
    }

    return ok(
      mediaArtifactTypeUpdatedEvent({
        id: command.id,
        update: command.update,
        userId: command.userId,
      }),
    )
  }
}

export type UpdateMediaArtifactTypeCommand = {
  id: string
  update: Omit<MediaArtifactType, 'id'>
  userId: number
}
