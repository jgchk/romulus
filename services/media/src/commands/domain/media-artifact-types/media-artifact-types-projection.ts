import { type MediaArtifactTypeEvent } from '../../../common/domain/events.js'
import {
  type MediaArtifactRelationshipType,
  type MediaArtifactType,
} from '../../../common/domain/types.js'

export type MediaArtifactTypesProjection = {
  types: Map<string, MediaArtifactType>
  relationshipTypes: Map<string, MediaArtifactRelationshipType>
}

export function createDefaultMediaArtifactTypesProjection(): MediaArtifactTypesProjection {
  return { types: new Map(), relationshipTypes: new Map() }
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

    case 'media-artifact-type-updated': {
      state.types.set(event.id, { id: event.id, ...event.update })
      return state
    }

    case 'media-artifact-type-deleted': {
      state.types.delete(event.id)
      for (const [relationshipTypeId, relationshipType] of state.relationshipTypes.entries()) {
        if (relationshipType.parentMediaArtifactType === event.id) {
          state.relationshipTypes.delete(relationshipTypeId)
          continue
        }

        for (const [
          index,
          childArtifactTypeId,
        ] of relationshipType.childMediaArtifactTypes.entries()) {
          if (childArtifactTypeId === event.id) {
            relationshipType.childMediaArtifactTypes.splice(index, 1)
          }
        }
      }
      return state
    }

    case 'media-artifact-relationship-type-created': {
      state.relationshipTypes.set(
        event.mediaArtifactRelationshipType.id,
        event.mediaArtifactRelationshipType,
      )
      return state
    }

    case 'media-artifact-relationship-type-updated': {
      state.relationshipTypes.set(event.id, { id: event.id, ...event.update })
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
