import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import type { MediaArtifactCreatedEvent } from '../../../common/domain/events.js'
import { mediaArtifactCreatedEvent } from '../../../common/domain/events.js'
import type { MediaArtifact } from '../../../common/domain/types.js'
import { MediaArtifactTypeNotFoundError } from '../media-artifact-types/errors.js'
import type { MediaArtifactTypesProjection } from '../media-artifact-types/media-artifact-types-projection.js'

export function createCreateMediaArtifactCommandHandler(projection: MediaArtifactTypesProjection) {
  return function (
    command: CreateMediaArtifactCommand,
  ): Result<MediaArtifactCreatedEvent, MediaArtifactTypeNotFoundError> {
    if (!projection.types.has(command.mediaArtifact.mediaArtifactType)) {
      return err(new MediaArtifactTypeNotFoundError(command.mediaArtifact.mediaArtifactType))
    }

    return ok(
      mediaArtifactCreatedEvent({
        mediaArtifact: command.mediaArtifact,
        userId: command.userId,
      }),
    )
  }
}

export type CreateMediaArtifactCommand = {
  mediaArtifact: MediaArtifact
  userId: number
}
