import { type Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import {
  type MediaArtifactRelationshipTypeCreatedEvent,
  mediaArtifactRelationshipTypeCreatedEvent,
} from '../../../common/domain/events.js'
import { type MediaArtifactRelationshipType } from '../../../common/domain/types.js'
import { MediaArtifactTypeNotFoundError } from '../media-artifact-types/errors.js'
import { type MediaArtifactTypesProjection } from '../media-artifact-types/media-artifact-types-projection.js'

export function createCreateMediaArtifactRelationshipTypeCommandHandler(
  projection: MediaArtifactTypesProjection,
) {
  function doesMediaArtifactTypeExist(mediaArtifactType: string) {
    return projection.types.has(mediaArtifactType)
  }

  return function createMediaArtifactRelationshipType(
    command: CreateMediaArtifactRelationshipTypeCommand,
  ): Result<MediaArtifactRelationshipTypeCreatedEvent, MediaArtifactTypeNotFoundError> {
    if (
      !doesMediaArtifactTypeExist(command.mediaArtifactRelationshipType.parentMediaArtifactType)
    ) {
      return err(
        new MediaArtifactTypeNotFoundError(
          command.mediaArtifactRelationshipType.parentMediaArtifactType,
        ),
      )
    }

    for (const childMediaArtifactType of command.mediaArtifactRelationshipType
      .childMediaArtifactTypes) {
      if (!doesMediaArtifactTypeExist(childMediaArtifactType)) {
        return err(new MediaArtifactTypeNotFoundError(childMediaArtifactType))
      }
    }

    return ok(
      mediaArtifactRelationshipTypeCreatedEvent({
        mediaArtifactRelationshipType: command.mediaArtifactRelationshipType,
        userId: command.userId,
      }),
    )
  }
}

export type CreateMediaArtifactRelationshipTypeCommand = {
  mediaArtifactRelationshipType: MediaArtifactRelationshipType
  userId: number
}
