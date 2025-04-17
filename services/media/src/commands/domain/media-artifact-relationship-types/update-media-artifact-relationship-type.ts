import { err, ok } from 'neverthrow'

import { mediaArtifactRelationshipTypeUpdatedEvent } from '../../../common/domain/events.js'
import type { MediaArtifactRelationshipType } from '../../../common/domain/types.js'
import { MediaArtifactTypeNotFoundError } from '../media-artifact-types/errors.js'
import type { MediaArtifactTypesProjection } from '../media-artifact-types/media-artifact-types-projection.js'
import { MediaArtifactRelationshipTypeNotFoundError } from './errors.js'

export function createUpdateMediaArtifactRelationshipTypeCommandHandler(
  projection: MediaArtifactTypesProjection,
) {
  function doesMediaArtifactTypeExist(mediaArtifactType: string) {
    return projection.types.has(mediaArtifactType)
  }

  function doesMediaArtifactRelationshipTypeExist(mediaArtifactRelationshipType: string) {
    return projection.relationshipTypes.has(mediaArtifactRelationshipType)
  }

  return function createUpdateMediaArtifactRelationshipType(
    command: UpdateMediaArtifactRelationshipTypeCommand,
  ) {
    if (!doesMediaArtifactRelationshipTypeExist(command.id)) {
      return err(new MediaArtifactRelationshipTypeNotFoundError(command.id))
    }

    if (!doesMediaArtifactTypeExist(command.update.parentMediaArtifactType)) {
      return err(new MediaArtifactTypeNotFoundError(command.update.parentMediaArtifactType))
    }

    for (const childMediaArtifactType of command.update.childMediaArtifactTypes) {
      if (!doesMediaArtifactTypeExist(childMediaArtifactType)) {
        return err(new MediaArtifactTypeNotFoundError(childMediaArtifactType))
      }
    }

    return ok(
      mediaArtifactRelationshipTypeUpdatedEvent({
        id: command.id,
        update: command.update,
        userId: command.userId,
      }),
    )
  }
}

export type UpdateMediaArtifactRelationshipTypeCommand = {
  id: string
  update: Omit<MediaArtifactRelationshipType, 'id'>
  userId: number
}
