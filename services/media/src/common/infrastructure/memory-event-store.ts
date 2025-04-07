import { TypedEmitter } from 'tiny-typed-emitter'

import type { IEventStore } from './event-store.js'

export class MemoryEventStore<Event extends object> implements IEventStore<Event> {
  private events: Map<string, { sequence: number; event: Event }[]>
  private sequence: number
  private eventEmitter: TypedEmitter<Record<string, (events: Event[]) => void>>

  constructor() {
    this.events = new Map()
    this.sequence = 0
    this.eventEmitter = new TypedEmitter()
  }

  get(id: string) {
    return (this.events.get(id) ?? []).map(({ event }) => event)
  }

  save(id: string, events: Event[]) {
    const currentEvents = this.events.get(id) ?? []
    currentEvents.push(...events.map((event) => ({ event, sequence: this.sequence++ })))
    this.events.set(id, currentEvents)

    this.eventEmitter.emit(id, events)
  }

  on(id: string, callback: (events: Event[]) => void): void {
    this.eventEmitter.on(id, callback)
  }

  off(id: string, callback: (events: Event[]) => void): void {
    this.eventEmitter.off(id, callback)
  }
}
