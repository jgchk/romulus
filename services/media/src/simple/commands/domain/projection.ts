import type { MediaTypeCreatedEvent } from './create-media-type.js'
import type { MediaType } from './types.js'

export type Projection = {
  mediaTypes: Map<string, MediaType>
}

export function createDefaultProjection(): Projection {
  return { mediaTypes: new Map() }
}

export function applyEvent(state: Projection, event: MediaTypeCreatedEvent) {
  switch (event._tag) {
    case 'media-type-created': {
      state.mediaTypes.set(event.mediaType.id, event.mediaType)
      return state
    }
  }
}

export function applyEvents(state: Projection, events: MediaTypeCreatedEvent[]) {
  return events.reduce(applyEvent, state)
}

export function createProjectionFromEvents(events: MediaTypeCreatedEvent[]) {
  return applyEvents(createDefaultProjection(), events)
}
