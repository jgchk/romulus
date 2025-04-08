import type { MediaArtifactSchemaEvent } from '../../common/domain/events.js'
import type { IEventStore } from '../../common/infrastructure/event-store.js'
import {
  createMediaArtifactSchemasProjectionFromEvents,
  type MediaArtifactSchemasProjection,
} from '../domain/media-artifact-schemas/media-artifact-schema-projection.js'

export function createGetMediaArtifactSchemas(
  eventStore: IEventStore<Record<`media-artifact-schema-${string}`, MediaArtifactSchemaEvent>>,
) {
  return async function getMediaArtifactSchemas(
    mediaType: string,
  ): Promise<MediaArtifactSchemasProjection> {
    const events = await eventStore.get(`media-artifact-schema-${mediaType}`)
    return createMediaArtifactSchemasProjectionFromEvents(events)
  }
}

export function createSaveMediaArtifactSchemaEvent(
  eventStore: IEventStore<Record<`media-artifact-schema-${string}`, MediaArtifactSchemaEvent>>,
) {
  return async function saveEvent(
    mediaType: string,
    event: MediaArtifactSchemaEvent,
  ): Promise<void> {
    await eventStore.save(`media-artifact-schema-${mediaType}`, [event])
  }
}
