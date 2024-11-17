import type { IEvent } from '../domain/event-store/event'
import type { IEventStore } from '../domain/event-store/event-store'

export class MemoryEventStore implements IEventStore {
  private events: IEvent[]

  constructor() {
    this.events = []
  }

  get() {
    return this.events
  }

  save(event: IEvent) {
    this.events.push(event)
  }
}
