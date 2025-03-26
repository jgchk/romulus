import type { Result } from 'neverthrow'
import { ok } from 'neverthrow'

import type { MediaTypeTreeCycleError } from './errors.js'

export function deleteMediaType(
  command: DeleteMediaTypeCommand,
): Result<MediaTypeDeletedEvent, MediaTypeTreeCycleError> {
  return ok(mediaTypeDeletedEvent({ id: command.id }))
}

export type DeleteMediaTypeCommand = {
  id: string
}

export type MediaTypeDeletedEvent = {
  _tag: 'media-type-deleted'
  id: string
}

export function mediaTypeDeletedEvent(
  event: Omit<MediaTypeDeletedEvent, '_tag'>,
): MediaTypeDeletedEvent {
  return { ...event, _tag: 'media-type-deleted' }
}
