import { withProps } from '$lib/utils/object'

import type { MediaTypeTreeEvent } from '../domain/events'
import type { IMediaTypeTreeRepository } from '../domain/repository'
import { MediaTypeTree } from '../domain/tree'

export class MemoryTreeRepository implements IMediaTypeTreeRepository {
  private store: EventStore

  constructor() {
    this.store = new EventStore()
  }

  get(id: string) {
    const events = this.store.get('media-type-trees')
    return MediaTypeTree.fromEvents(id, events ?? [])
  }

  save(tree: MediaTypeTree) {
    this.store.save('media-type-trees', tree.getUncommittedEvents())
  }
}

class EventStore {
  private events: Map<string, (MediaTypeTreeEvent & { _sequence: number })[]>
  private sequence: number

  constructor() {
    this.events = new Map()
    this.sequence = 0
  }

  has(id: string) {
    return this.events.has(id)
  }

  get(id: string) {
    return this.events.get(id)
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
