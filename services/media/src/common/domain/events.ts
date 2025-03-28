import type { MediaType } from '../../commands/domain/types.js'

export type MediaTypeEvent = MediaTypeCreatedEvent | MediaTypeDeletedEvent | MediaTypeUpdatedEvent

export type MediaTypeCreatedEvent = {
  _tag: 'media-type-created'
  mediaType: MediaType
}

export function mediaTypeCreatedEvent(
  event: Omit<MediaTypeCreatedEvent, '_tag'>,
): MediaTypeCreatedEvent {
  return { ...event, _tag: 'media-type-created' }
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

export type MediaTypeUpdatedEvent = {
  _tag: 'media-type-updated'
  id: string
  update: Omit<MediaType, 'id'>
}

export function mediaTypeUpdatedEvent(
  event: Omit<MediaTypeUpdatedEvent, '_tag'>,
): MediaTypeUpdatedEvent {
  return { ...event, _tag: 'media-type-updated' }
}
