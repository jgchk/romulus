import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import { type MediaTypeCreatedEvent, mediaTypeCreatedEvent } from '../../common/domain/events.js'
import { MediaTypeTreeCycleError } from './errors.js'
import type { MediaType } from './types.js'

export function createMediaType(
  command: CreateMediaTypeCommand,
): Result<MediaTypeCreatedEvent, MediaTypeTreeCycleError> {
  if (command.mediaType.parents.includes(command.mediaType.id)) {
    return err(new MediaTypeTreeCycleError([command.mediaType.name, command.mediaType.name]))
  }

  return ok(mediaTypeCreatedEvent({ mediaType: command.mediaType }))
}

export type CreateMediaTypeCommand = {
  mediaType: MediaType
}
