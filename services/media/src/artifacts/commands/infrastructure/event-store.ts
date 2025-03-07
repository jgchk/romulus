import EventEmitter from 'events'

import type { ArtifactsEvent } from '../domain/events.js'

export function createEventStore() {
  const emitter = new EventEmitter()

  return {
    subscribe<E extends ArtifactsEvent>(kind: E['kind'], listener: (event: E) => void) {
      emitter.addListener(kind, listener)
    },

    appendEvent(event: ArtifactsEvent) {
      emitter.emit(event.kind, event)
    },
  }
}
