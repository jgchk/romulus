import type { IEventStore } from '../domain/event-store'
import type { Event } from '../domain/events'

export class MemoryEventStore implements IEventStore {
  private events: Event[]

  constructor() {
    this.events = []
  }

  get() {
    return this.events
  }

  save(event: Event) {
    this.events.push(event)
  }
}
