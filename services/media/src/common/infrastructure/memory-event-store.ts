import { TypedEmitter } from 'tiny-typed-emitter'

import type { DefaultEventSignature, EventSignature, IEventStore } from './event-store.js'

export class MemoryEventStore<L extends EventSignature<L> = DefaultEventSignature>
  implements IEventStore<EventSignature<L>>
{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private events: Map<keyof L, { sequence: number; event: any }[]>
  private sequence: number
  private eventEmitter: TypedEmitter<{ [E in keyof L]: (events: L[E][]) => void }>

  constructor() {
    this.events = new Map()
    this.sequence = 0
    this.eventEmitter = new TypedEmitter()
  }

  get<U extends keyof L>(id: U): L[U][] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (this.events.get(id) ?? []).map(({ event }) => event)
  }

  save<U extends keyof L>(id: U, events: L[U][]): void {
    const currentEvents = this.events.get(id) ?? []
    currentEvents.push(...events.map((event) => ({ event, sequence: this.sequence++ })))
    this.events.set(id, currentEvents)

    // @ts-expect-error - TS is not smart enough to infer the type of `events`
    this.eventEmitter.emit(id, events)
  }

  on<U extends keyof L>(id: U, callback: (events: L[U][]) => void): void {
    this.eventEmitter.on(id, callback)
  }

  off<U extends keyof L>(id: U, callback: (events: L[U][]) => void): void {
    this.eventEmitter.off(id, callback)
  }
}
