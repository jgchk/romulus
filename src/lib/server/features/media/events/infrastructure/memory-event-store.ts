import type { MaybePromise } from '$lib/utils/types'

import type { IEvent } from '../domain/event'

export class MemoryEventStore {
  private events: Map<string, IEvent<unknown>[]>

  constructor() {
    this.events = new Map()
  }

  append(eventSourceId: string, name: string, data: unknown) {
    const eventStream = this.events.get(eventSourceId) ?? []
    const currentVersion = Math.max(0, ...eventStream.map((event) => event.version))

    const allEvents = [...this.events.values()].flat()
    const currentSequence = Math.max(0, ...allEvents.map((event) => event.sequence))

    const event: IEvent<unknown> = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      name,
      version: currentVersion + 1,
      eventSourceId,
      sequence: currentSequence + 1,
      data,
    }

    eventStream.push(event)
    this.events.set(eventSourceId, eventStream)

    return event
  }

  getEvents(eventSourceId: string) {
    const eventStream = this.events.get(eventSourceId) ?? []
    return eventStream.sort((a, b) => a.version - b.version)
  }

  getAllEvents(): MaybePromise<IEvent<unknown>[]> {
    const allEvents = [...this.events.values()].flat()
    return allEvents.sort((a, b) => a.sequence - b.sequence)
  }
}
