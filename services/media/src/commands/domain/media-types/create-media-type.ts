import { type Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import { type MediaTypeCreatedEvent, mediaTypeCreatedEvent } from '../../../common/domain/events.js'
import { type MediaType } from '../../../common/domain/types.js'
import { MediaTypeNotFoundError, MediaTypeTreeCycleError } from './errors.js'
import { type MediaTypesProjection } from './media-types-projection.js'

export function createCreateMediaTypeCommandHandler(projection: MediaTypesProjection) {
  return function createMediaType(
    command: CreateMediaTypeCommand,
  ): Result<MediaTypeCreatedEvent, MediaTypeTreeCycleError | MediaTypeNotFoundError> {
    if (command.mediaType.parents.includes(command.mediaType.id)) {
      return err(new MediaTypeTreeCycleError([command.mediaType.name, command.mediaType.name]))
    }

    for (const parentId of command.mediaType.parents) {
      if (!projection.mediaTypes.has(parentId)) {
        return err(new MediaTypeNotFoundError(parentId))
      }
    }

    return ok(mediaTypeCreatedEvent({ mediaType: command.mediaType, userId: command.userId }))
  }
}

export type CreateMediaTypeCommand = {
  mediaType: MediaType
  userId: number
}
