import {
  type MediaArtifact,
  type MediaArtifactRelationshipType,
  type MediaArtifactType,
  type MediaType,
} from './types.js'

export type MediaTypeEvent = MediaTypeCreatedEvent | MediaTypeDeletedEvent | MediaTypeUpdatedEvent

export type MediaTypeCreatedEvent = {
  _tag: 'media-type-created'
  mediaType: MediaType
  userId: number
}

export function mediaTypeCreatedEvent(
  event: Omit<MediaTypeCreatedEvent, '_tag'>,
): MediaTypeCreatedEvent {
  return { ...event, _tag: 'media-type-created' }
}

export type MediaTypeDeletedEvent = {
  _tag: 'media-type-deleted'
  id: string
  userId: number
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
  userId: number
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
  userId: number
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
  userId: number
}

export function mediaArtifactTypeUpdatedEvent(
  event: Omit<MediaArtifactTypeUpdatedEvent, '_tag'>,
): MediaArtifactTypeUpdatedEvent {
  return { ...event, _tag: 'media-artifact-type-updated' }
}

export type MediaArtifactTypeDeletedEvent = {
  _tag: 'media-artifact-type-deleted'
  id: string
  userId: number
}

export function mediaArtifactTypeDeletedEvent(
  event: Omit<MediaArtifactTypeDeletedEvent, '_tag'>,
): MediaArtifactTypeDeletedEvent {
  return { ...event, _tag: 'media-artifact-type-deleted' }
}

export type MediaArtifactRelationshipTypeCreatedEvent = {
  _tag: 'media-artifact-relationship-type-created'
  mediaArtifactRelationshipType: MediaArtifactRelationshipType
  userId: number
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
  userId: number
}

export function mediaArtifactRelationshipTypeUpdatedEvent(
  event: Omit<MediaArtifactRelationshipTypeUpdatedEvent, '_tag'>,
): MediaArtifactRelationshipTypeUpdatedEvent {
  return { ...event, _tag: 'media-artifact-relationship-type-updated' }
}

export type MediaArtifactEvent = MediaArtifactCreatedEvent

export type MediaArtifactCreatedEvent = {
  _tag: 'media-artifact-created'
  mediaArtifact: MediaArtifact
  userId: number
}

export function mediaArtifactCreatedEvent(
  event: Omit<MediaArtifactCreatedEvent, '_tag'>,
): MediaArtifactCreatedEvent {
  return { ...event, _tag: 'media-artifact-created' }
}
