import type { IEventStore } from './event-store.js'

export class MemoryEventStore<Event extends object> implements IEventStore<Event> {
  private events: Map<string, { sequence: number; event: Event }[]>
  private sequence: number

  constructor() {
    this.events = new Map()
    this.sequence = 0
  }

  get(id: string) {
    return (this.events.get(id) ?? []).map(({ event }) => event)
  }

  save(id: string, events: Event[]) {
    const currentEvents = this.events.get(id) ?? []
    currentEvents.push(...events.map((event) => ({ event, sequence: this.sequence++ })))
    this.events.set(id, currentEvents)
  }
}
