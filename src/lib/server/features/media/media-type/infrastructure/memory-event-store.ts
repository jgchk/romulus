import type { IMediaTypeEventStore } from '../domain/event-store'
import type { MediaTypeEvent } from '../domain/events'

export class MemoryMediaTypeEventStore implements IMediaTypeEventStore {
  private events: MediaTypeEvent[]

  constructor() {
    this.events = []
  }

  get() {
    return this.events
  }

  save(event: MediaTypeEvent) {
    this.events.push(event)
  }
}
