import { type MediaTypeEvent } from '../../../common/domain/events.js'
import { type MediaType } from '../../../common/domain/types.js'

export type MediaTypesProjection = {
  mediaTypes: Map<string, MediaType>
}

export function createDefaultMediaTypesProjection(): MediaTypesProjection {
  return { mediaTypes: new Map() }
}

export function applyMediaTypeEvent(
  state: MediaTypesProjection,
  event: MediaTypeEvent,
): MediaTypesProjection {
  switch (event._tag) {
    case 'media-type-created': {
      state.mediaTypes.set(event.mediaType.id, event.mediaType)
      return state
    }
    case 'media-type-deleted': {
      state.mediaTypes.delete(event.id)
      return state
    }
    case 'media-type-updated': {
      state.mediaTypes.set(event.id, { ...state.mediaTypes.get(event.id)!, ...event.update })
      return state
    }
  }
}

export function applyMediaTypeEvents(
  state: MediaTypesProjection,
  events: MediaTypeEvent[],
): MediaTypesProjection {
  return events.reduce(applyMediaTypeEvent, state)
}

export function createMediaTypesProjectionFromEvents(
  events: MediaTypeEvent[],
): MediaTypesProjection {
  return applyMediaTypeEvents(createDefaultMediaTypesProjection(), events)
}
