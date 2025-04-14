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
  | MediaArtifactTypeUpdatedEvent
  | MediaArtifactTypeDeletedEvent
  | MediaArtifactRelationshipTypeCreatedEvent
  | MediaArtifactRelationshipTypeUpdatedEvent

export type MediaArtifactTypeCreatedEvent = {
  _tag: 'media-artifact-type-created'
  mediaArtifactType: MediaArtifactType
}

export function mediaArtifactTypeCreatedEvent(
  event: Omit<MediaArtifactTypeCreatedEvent, '_tag'>,
): MediaArtifactTypeCreatedEvent {
  return { ...event, _tag: 'media-artifact-type-created' }
}

export type MediaArtifactTypeUpdatedEvent = {
  _tag: 'media-artifact-type-updated'
  id: string
  update: Omit<MediaArtifactType, 'id'>
}

export function mediaArtifactTypeUpdatedEvent(
  event: Omit<MediaArtifactTypeUpdatedEvent, '_tag'>,
): MediaArtifactTypeUpdatedEvent {
  return { ...event, _tag: 'media-artifact-type-updated' }
}

export type MediaArtifactTypeDeletedEvent = {
  _tag: 'media-artifact-type-deleted'
  id: string
}

export function mediaArtifactTypeDeletedEvent(
  event: Omit<MediaArtifactTypeDeletedEvent, '_tag'>,
): MediaArtifactTypeDeletedEvent {
  return { ...event, _tag: 'media-artifact-type-deleted' }
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

export type MediaArtifactRelationshipTypeUpdatedEvent = {
  _tag: 'media-artifact-relationship-type-updated'
  id: string
  update: Omit<MediaArtifactRelationshipType, 'id'>
}

export function mediaArtifactRelationshipTypeUpdatedEvent(
  event: Omit<MediaArtifactRelationshipTypeUpdatedEvent, '_tag'>,
): MediaArtifactRelationshipTypeUpdatedEvent {
  return { ...event, _tag: 'media-artifact-relationship-type-updated' }
}
