import { withProps } from '$lib/utils/object'

import { MediaTypeTreeNotFoundError } from '../domain/errors'
import type { MediaTypeTreeEvent } from '../domain/tree/events'
import type { IMediaTypeTreeRepository } from '../domain/tree/repository'
import { MediaTypeTree } from '../domain/tree/tree'

export class MemoryTreeRepository implements IMediaTypeTreeRepository {
  private store: EventStore

  constructor() {
    this.store = new EventStore()
  }

  has(id: string) {
    return this.store.has(id)
  }

  get(id: string) {
    const events = this.store.get(id)
    if (events === undefined) {
      return new MediaTypeTreeNotFoundError(id)
    }

    return MediaTypeTree.fromEvents(events)
  }

  getToCommit(id: string, commitId: string | undefined) {
    if (commitId === undefined) {
      return MediaTypeTree.fromEvents([])
    }

    const events = this.store.get(id)
    if (events === undefined) {
      return new MediaTypeTreeNotFoundError(id)
    }

    const commitEvent = events.findIndex(
      (event) => 'commitId' in event && event.commitId == commitId,
    )
    const eventsToCommit = events.slice(0, commitEvent + 1)
    return MediaTypeTree.fromEvents(eventsToCommit)
  }

  copy(id: string) {
    const events = this.store.get(id)
    if (events === undefined) {
      return new MediaTypeTreeNotFoundError(id)
    }

    return MediaTypeTree.copyEvents(events)
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
