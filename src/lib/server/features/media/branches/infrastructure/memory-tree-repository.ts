import { withProps } from '$lib/utils/object'

import type { MediaTypeTreeEvent } from '../domain/tree/events'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'
import { MediaTypeTree } from '../domain/tree/tree'

export class MemoryTreeRepository implements IMediaTypeTreeRepository {
  private store: EventStore

  constructor() {
    this.store = new EventStore()
  }

  get(id: string) {
    const events = this.store.get(id)
    return MediaTypeTree.fromEvents(events)
  }

  getFromCommits(commitIds: Set<string>) {
    const events = this.store.getAll()
    const filteredEvents = events.filter((event) => commitIds.has(event.commitId))
    return MediaTypeTree.fromEvents(filteredEvents)
  }

  save(id: string, tree: MediaTypeTree) {
    this.store.save(id, tree.getUncommittedEvents())
  }
}

class EventStore {
  private events: Map<string, (MediaTypeTreeEvent & { _sequence: number })[]>
  private sequence: number

  constructor() {
    this.events = new Map()
    this.sequence = 0
  }

  get(id: string) {
    return this.events.get(id) ?? []
  }

  getAll() {
    return [...this.events.values()].flat().sort((a, b) => a._sequence - b._sequence)
  }

  save(id: string, events: MediaTypeTreeEvent[]) {
    const currentEvents = this.events.get(id) ?? []
    currentEvents.push(...events.map((event) => withProps(event, { _sequence: this.sequence++ })))
    this.events.set(id, currentEvents)
  }
}
