import type { MediaArtifactTypeEvent } from '../../../common/domain/events.js'
import type { MediaArtifactType } from '../../../common/domain/types.js'

export type MediaArtifactTypesProjection = {
  types: Map<string, MediaArtifactType>
}

export function createDefaultMediaArtifactTypesProjection(): MediaArtifactTypesProjection {
  return { types: new Map() }
}

export function applyMediaArtifactTypeEvent(
  state: MediaArtifactTypesProjection,
  event: MediaArtifactTypeEvent,
): MediaArtifactTypesProjection {
  switch (event._tag) {
    case 'media-artifact-type-created': {
      state.types.set(event.mediaArtifactType.id, event.mediaArtifactType)
      return state
    }
  }
}

export function applyMediaArtifactTypeEvents(
  state: MediaArtifactTypesProjection,
  events: MediaArtifactTypeEvent[],
): MediaArtifactTypesProjection {
  return events.reduce(applyMediaArtifactTypeEvent, state)
}

export function createMediaArtifactTypesProjectionFromEvents(
  events: MediaArtifactTypeEvent[],
): MediaArtifactTypesProjection {
  return applyMediaArtifactTypeEvents(createDefaultMediaArtifactTypesProjection(), events)
}
