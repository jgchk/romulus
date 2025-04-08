import type { MediaArtifactSchemaEvent } from '../../../common/domain/events.js'
import type { MediaArtifactSchema } from '../../../common/domain/types.js'

export type MediaArtifactSchemasProjection = {
  schemas: Map<string, MediaArtifactSchema>
}

export function createDefaultMediaArtifactSchemasProjection(): MediaArtifactSchemasProjection {
  return { schemas: new Map() }
}

export function applyMediaArtifactSchemaEvent(
  state: MediaArtifactSchemasProjection,
  event: MediaArtifactSchemaEvent,
): MediaArtifactSchemasProjection {
  switch (event._tag) {
    case 'media-artifact-schema-created': {
      state.schemas.set(event.schema.id, event.schema)
      return state
    }
  }
}

export function applyMediaArtifactSchemaEvents(
  state: MediaArtifactSchemasProjection,
  events: MediaArtifactSchemaEvent[],
): MediaArtifactSchemasProjection {
  return events.reduce(applyMediaArtifactSchemaEvent, state)
}

export function createMediaArtifactSchemasProjectionFromEvents(
  events: MediaArtifactSchemaEvent[],
): MediaArtifactSchemasProjection {
  return applyMediaArtifactSchemaEvents(createDefaultMediaArtifactSchemasProjection(), events)
}
