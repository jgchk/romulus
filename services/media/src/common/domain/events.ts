import type { MediaArtifactRelationshipType, MediaArtifactType, MediaType } from './types.js'

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

export type MediaArtifactTypeEvent =
  | MediaArtifactTypeCreatedEvent
  | MediaArtifactRelationshipTypeCreatedEvent

export type MediaArtifactTypeCreatedEvent = {
  _tag: 'media-artifact-type-created'
  mediaArtifactType: MediaArtifactType
}

export function mediaArtifactTypeCreatedEvent(
  event: Omit<MediaArtifactTypeCreatedEvent, '_tag'>,
): MediaArtifactTypeCreatedEvent {
  return { ...event, _tag: 'media-artifact-type-created' }
}

export type MediaArtifactRelationshipTypeCreatedEvent = {
  _tag: 'media-artifact-relationship-type-created'
  mediaArtifactRelationshipType: MediaArtifactRelationshipType
}

export function mediaArtifactRelationshipTypeCreatedEvent(
  event: Omit<MediaArtifactRelationshipTypeCreatedEvent, '_tag'>,
): MediaArtifactRelationshipTypeCreatedEvent {
  return { ...event, _tag: 'media-artifact-relationship-type-created' }
}
