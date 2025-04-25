import { EventEmitter } from 'node:events'

import type {
  DefaultEventSignature,
  EventEnvelope,
  EventSignature,
  IEventStore,
} from './event-store.js'

export class MemoryEventStore<L extends EventSignature<L> = DefaultEventSignature>
  implements IEventStore<EventSignature<L>>
{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private events: Map<keyof L, EventEnvelope<string, any>[]>
  private sequence: number
  private eventEmitter: EventEmitter

  constructor() {
    this.events = new Map()
    this.sequence = 1
    this.eventEmitter = new EventEmitter()
  }

  get<T extends keyof L = keyof L>(aggregateId: T): EventEnvelope<T, L[T]>[] {
    return (this.events.get(aggregateId) ?? []) as EventEnvelope<T, L[T]>[]
  }

  getAll<T extends keyof L = keyof L>(): EventEnvelope<T, L[T]>[] {
    // Collect all events from all streams
    const allEvents: EventEnvelope<T, L[T]>[] = []
    for (const events of this.events.values()) {
      allEvents.push(...(events as EventEnvelope<T, L[T]>[]))
    }

    // Sort by sequence number
    return allEvents.sort((a, b) => a.sequence - b.sequence)
  }

  save<U extends keyof L>(aggregateId: U, events: L[U][]): void {
    const currentEvents = this.get(aggregateId)
    const currentVersion = Math.max(...currentEvents.map((event) => event.version), 0)

    const envelopedEvents = events.map((eventData, i) => ({
      aggregateId,
      version: currentVersion + 1 + i,
      sequence: this.sequence++,
      timestamp: new Date(),
      eventData,
    }))

    currentEvents.push(...envelopedEvents)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.events.set(aggregateId, currentEvents as EventEnvelope<string, any>[])

    this.eventEmitter.emit(aggregateId.toString(), envelopedEvents)

    // Emit to global subscribers
    this.eventEmitter.emit('*', envelopedEvents)
  }

  on<U extends keyof L>(
    aggregateId: U,
    callback: (events: EventEnvelope<U, L[U]>[]) => void,
  ): void {
    this.eventEmitter.on(aggregateId.toString(), callback)
  }

  off<U extends keyof L>(
    aggregateId: U,
    callback: (events: EventEnvelope<U, L[U]>[]) => void,
  ): void {
    this.eventEmitter.off(aggregateId.toString(), callback)
  }

  onAll<T extends keyof L = keyof L>(callback: (events: EventEnvelope<T, L[T]>[]) => void): void {
    this.eventEmitter.on('*', callback)
  }

  offAll<T extends keyof L = keyof L>(callback: (events: EventEnvelope<T, L[T]>[]) => void): void {
    this.eventEmitter.off('*', callback)
  }
}
