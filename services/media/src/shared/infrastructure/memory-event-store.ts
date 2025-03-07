import type { IEventStore } from '../domain/event-store.js'

export class MemoryEventStore<Event extends object> implements IEventStore<Event> {
  private events: Map<string, (Event & { _sequence: number })[]>
  private sequence: number

  constructor() {
    this.events = new Map()
    this.sequence = 0
  }

  get(id: string) {
    return this.events.get(id)
  }

  getAll() {
    return [...this.events.values()].flat().sort((a, b) => a._sequence - b._sequence)
  }

  save(id: string, events: Event[]) {
    const currentEvents = this.events.get(id) ?? []
    currentEvents.push(...events.map((event) => withProps(event, { _sequence: this.sequence++ })))
    this.events.set(id, currentEvents)
  }
}

function withProps<T extends object, P extends Record<string, unknown>>(
  something: T,
  props: P,
): T & P {
  Object.assign(something, props)
  return something as T & P
}
