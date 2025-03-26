import type { MediaTypeEvent } from '../../common/domain/events.js'
import type { MediaType } from './types.js'

export type Projection = {
  mediaTypes: Map<string, MediaType>
}

export function createDefaultProjection(): Projection {
  return { mediaTypes: new Map() }
}

export function applyEvent(state: Projection, event: MediaTypeEvent): Projection {
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

export function applyEvents(state: Projection, events: MediaTypeEvent[]): Projection {
  return events.reduce(applyEvent, state)
}

export function createProjectionFromEvents(events: MediaTypeEvent[]): Projection {
  return applyEvents(createDefaultProjection(), events)
}
