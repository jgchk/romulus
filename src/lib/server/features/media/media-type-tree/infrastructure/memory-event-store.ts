import type { IMediaTypeTreeEventStore } from '../domain/event-store'
import type { MediaTypeTreeEvent } from '../domain/events'

export class MemoryMediaTypeTreeEventStore implements IMediaTypeTreeEventStore {
  private events: MediaTypeTreeEvent[]

  constructor() {
    this.events = []
  }

  get() {
    return this.events
  }

  save(event: MediaTypeTreeEvent) {
    this.events.push(event)
  }
}
