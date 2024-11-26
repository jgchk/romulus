import { withProps } from '$lib/utils/object'

import type { MainTreeManagerEvent } from '../domain/main-tree-manager/events'
import { MainTreeManager } from '../domain/main-tree-manager/main-tree-manager'
import type { IMainTreeManagerRepository } from '../domain/main-tree-manager/repository'

export class MemoryMainTreeManagerRepository implements IMainTreeManagerRepository {
  private store: EventStore

  constructor() {
    this.store = new EventStore()
  }

  get() {
    const events = this.store.get('main-tree-manager')
    return MainTreeManager.fromEvents(events ?? [])
  }

  save(manager: MainTreeManager) {
    this.store.save('main-tree-manager', manager.getUncommittedEvents())
  }
}

class EventStore {
  private events: Map<string, (MainTreeManagerEvent & { _sequence: number })[]>
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

  save(id: string, events: MainTreeManagerEvent[]) {
    const currentEvents = this.events.get(id) ?? []
    currentEvents.push(...events.map((event) => withProps(event, { _sequence: this.sequence++ })))
    this.events.set(id, currentEvents)
  }
}
