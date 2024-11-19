import { CustomError } from '$lib/utils/error'

import { MediaTypeAddedEvent, MediaTypeParentAddedEvent, type MediaTypeTreeEvent } from './events'

export class MediaTypeTree {
  private state: MediaTypeTreeState
  private uncommittedEvents: MediaTypeTreeEvent[]

  private constructor(state: MediaTypeTreeState, uncommittedEvents: MediaTypeTreeEvent[]) {
    this.state = state
    this.uncommittedEvents = uncommittedEvents
  }

  static create(): MediaTypeTree {
    return new MediaTypeTree(MediaTypeTreeState.create(), [])
  }

  static fromEvents(events: MediaTypeTreeEvent[]) {
    const tree = MediaTypeTree.create()

    for (const event of events) {
      tree.applyEvent(event)
    }

    return tree
  }

  clone(): MediaTypeTree {
    return new MediaTypeTree(this.state.clone(), [...this.uncommittedEvents])
  }

  applyEvent(event: MediaTypeTreeEvent): void {
    if (event instanceof MediaTypeAddedEvent) {
      this.state.setCurrentId(event.id)
      this.state.addMediaType(event.id)
    } else if (event instanceof MediaTypeParentAddedEvent) {
      const result = this.state.addChildToMediaType(event.parentId, event.childId)
      if (result instanceof Error) {
        throw result
      }
    }
  }

  private addEvent(event: MediaTypeTreeEvent): void {
    this.uncommittedEvents.push(event)
  }

  addMediaType(): MediaTypeAddedEvent {
    const id = this.state.getCurrentId() + 1
    const event = new MediaTypeAddedEvent(id)

    this.applyEvent(event)
    this.addEvent(event)

    return event
  }

  addParentToMediaType(
    childId: number,
    parentId: number,
  ): MediaTypeParentAddedEvent | MediaTypeNotFoundError | CycleError {
    const newState = this.state.clone()
    const result = newState.addChildToMediaType(parentId, childId)
    if (result instanceof Error) {
      return result
    }

    const event = new MediaTypeParentAddedEvent(childId, parentId)

    this.applyEvent(event)
    this.addEvent(event)

    return event
  }

  getAllMediaTypes(): { id: number; children: Set<number> }[] {
    return this.state.getAllMediaTypes()
  }

  getUncommittedEvents(): MediaTypeTreeEvent[] {
    return this.uncommittedEvents
  }
}

class MediaTypeTreeState {
  private currId: number
  private nodes: Map<number, { children: Set<number> }>

  private constructor(currId: number, nodes: Map<number, { children: Set<number> }>) {
    this.currId = currId
    this.nodes = nodes
  }

  static create(): MediaTypeTreeState {
    return new MediaTypeTreeState(0, new Map())
  }

  clone(): MediaTypeTreeState {
    return new MediaTypeTreeState(this.currId, new Map(structuredClone(this.nodes)))
  }

  getCurrentId(): number {
    return this.currId
  }

  setCurrentId(id: number): void {
    this.currId = id
  }

  addMediaType(id: number): void {
    this.nodes.set(id, { children: new Set() })
  }

  addChildToMediaType(
    parentId: number,
    childId: number,
  ): void | MediaTypeNotFoundError | CycleError {
    const parent = this.nodes.get(parentId)
    if (!parent) {
      return new MediaTypeNotFoundError(parentId)
    }

    const children = this.nodes.get(childId)
    if (!children) {
      return new MediaTypeNotFoundError(childId)
    }

    const cycle = this.hasPath(childId, parentId)
    if (cycle) {
      return new CycleError([...cycle, childId])
    }

    parent.children.add(childId)
  }

  private hasPath(source: number, destination: number): number[] | undefined {
    const visited = new Set<number>()
    const path: number[] = []

    const dfs = (current: number): number[] | undefined => {
      if (current === destination) {
        return [...path, current]
      }

      visited.add(current)
      path.push(current)

      const neighbors = this.nodes.get(current)?.children ?? new Set<number>()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const cyclePath = dfs(neighbor)
          if (cyclePath) {
            return cyclePath
          }
        }
      }

      // Backtrack: remove the current node from path when going back up
      path.pop()
    }

    return dfs(source)
  }

  getAllMediaTypes(): { id: number; children: Set<number> }[] {
    return [...this.nodes.entries()].map(([id, node]) => ({ id: id, children: node.children }))
  }
}

export class MediaTypeNotFoundError extends CustomError {
  constructor(public readonly id: number) {
    super('MediaTypeNotFoundError', `A media type was not found for id: ${id}`)
  }
}

export class CycleError extends CustomError {
  constructor(public readonly cycle: number[]) {
    super('CycleError', `A cycle was detected: ${cycle.join(' -> ')}`)
  }
}
