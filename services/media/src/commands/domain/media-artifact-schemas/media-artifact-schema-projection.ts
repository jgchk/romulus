import type { MediaArtifactSchemaEvent } from '../../../common/domain/events.js'
import type { MediaArtifactSchema } from '../../../common/domain/types.js'

export type Projection = {
  schemas: Map<string, MediaArtifactSchema>
}

export function createDefaultProjection(): Projection {
  return { schemas: new Map() }
}

export function applyEvent(state: Projection, event: MediaArtifactSchemaEvent): Projection {
  switch (event._tag) {
    case 'media-artifact-schema-created': {
      state.schemas.set(event.schema.id, event.schema)
      return state
    }
  }
}

export function applyEvents(state: Projection, events: MediaArtifactSchemaEvent[]): Projection {
  return events.reduce(applyEvent, state)
}

export function createProjectionFromEvents(events: MediaArtifactSchemaEvent[]): Projection {
  return applyEvents(createDefaultProjection(), events)
}
