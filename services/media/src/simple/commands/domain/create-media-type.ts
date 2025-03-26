import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

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

export type MediaTypeCreatedEvent = {
  _tag: 'media-type-created'
  mediaType: MediaType
}

export function mediaTypeCreatedEvent(
  event: Omit<MediaTypeCreatedEvent, '_tag'>,
): MediaTypeCreatedEvent {
  return { ...event, _tag: 'media-type-created' }
}
