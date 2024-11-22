import { MediaTypeNameInvalidError } from './errors'
import { MediaTypeAlreadyExistsError, MediaTypeNotFoundError, WillCreateCycleError } from './errors'
import {
  MediaTypeAddedEvent,
  MediaTypeRemovedEvent,
  type MediaTypeTreeEvent,
  ParentAddedToMediaTypeEvent,
} from './events'

export class MediaTypeTree {
  private state: MediaTypeTreeState
  private uncommittedEvents: MediaTypeTreeEvent[]

  private constructor(state: MediaTypeTreeState, uncommittedEvents: MediaTypeTreeEvent[]) {
    this.state = state
    this.uncommittedEvents = uncommittedEvents
  }

  static fromEvents(events: MediaTypeTreeEvent[]): MediaTypeTree {
    const tree = new MediaTypeTree(MediaTypeTreeState.create(), [])
    for (const event of events) {
      tree.applyEvent(event)
    }
    return tree
  }

  getUncommittedEvents(): MediaTypeTreeEvent[] {
    return [...this.uncommittedEvents]
  }

  private applyEvent(event: MediaTypeTreeEvent): void {
    if (event instanceof MediaTypeAddedEvent) {
      const error = this.state.addMediaType(event.mediaTypeId, event.mediaTypeName)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeRemovedEvent) {
      const error = this.state.removeMediaType(event.mediaTypeId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof ParentAddedToMediaTypeEvent) {
      const error = this.state.addChildToMediaType(event.parentId, event.childId)
      if (error instanceof Error) {
        throw error
      }
    } else {
      // exhaustive check
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = event
    }
  }

  private addEvent(event: MediaTypeTreeEvent): void {
    this.uncommittedEvents.push(event)
  }

  addMediaType(
    id: string,
    name: string,
  ): void | MediaTypeAlreadyExistsError | MediaTypeNameInvalidError {
    const trimmedName = name.trim().replace(/\n/g, '')
    if (trimmedName.length === 0) {
      return new MediaTypeNameInvalidError(name)
    }

    const error = this.state.clone().addMediaType(id, trimmedName)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeAddedEvent(id, trimmedName)

    this.applyEvent(event)
    this.addEvent(event)
  }

  removeMediaType(id: string): void | MediaTypeNotFoundError {
    const error = this.state.clone().removeMediaType(id)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeRemovedEvent(id)

    this.applyEvent(event)
    this.addEvent(event)
  }

  addParentToMediaType(
    childId: string,
    parentId: string,
  ): void | MediaTypeNotFoundError | WillCreateCycleError {
    const error = this.state.clone().addChildToMediaType(parentId, childId)
    if (error instanceof Error) {
      return error
    }

    const event = new ParentAddedToMediaTypeEvent(childId, parentId)

    this.applyEvent(event)
    this.addEvent(event)
  }

  merge(
    sourceTree: MediaTypeTree,
    baseTree: MediaTypeTree | undefined,
  ): void | MediaTypeAlreadyExistsError | WillCreateCycleError {
    const baseTreeState =
      baseTree === undefined ? MediaTypeTreeState.create() : baseTree.state.clone()
    const events = this.state.clone().merge(sourceTree.state.clone(), baseTreeState)
    if (events instanceof Error) {
      return events
    }

    for (const event of events) {
      this.applyEvent(event)
      this.addEvent(event)
    }
  }
}

class MediaTypeTreeState {
  private nodes: Map<string, MediaTypeNode>

  private constructor(nodes: Map<string, MediaTypeNode>) {
    this.nodes = nodes
  }

  static create(): MediaTypeTreeState {
    return new MediaTypeTreeState(new Map())
  }

  clone(): MediaTypeTreeState {
    return new MediaTypeTreeState(
      new Map([...this.nodes.entries()].map(([id, node]) => [id, node.clone()])),
    )
  }

  addMediaType(id: string, name: string): void | MediaTypeAlreadyExistsError {
    if (this.nodes.has(id)) {
      return new MediaTypeAlreadyExistsError(id)
    }

    this.nodes.set(id, MediaTypeNode.create(name))
  }

  removeMediaType(id: string): void | MediaTypeNotFoundError {
    if (!this.nodes.has(id)) {
      return new MediaTypeNotFoundError(id)
    }

    this.moveChildrenUnderParents(id)
    this.nodes.delete(id)
  }

  private moveChildrenUnderParents(id: string): void {
    const childIds = this.getMediaTypeChildren(id)
    const parentIds = this.getMediaTypeParents(id)

    for (const parentId of parentIds) {
      for (const childId of childIds) {
        const error = this.addChildToMediaType(parentId, childId)
        if (error instanceof WillCreateCycleError) {
          throw error // should never happen
        } else if (error instanceof MediaTypeNotFoundError) {
          throw error // should never happen
        }
      }
    }
  }

  private getMediaTypeChildren(id: string): Set<string> {
    return this.nodes.get(id)?.getChildren() ?? new Set()
  }

  private getMediaTypeParents(id: string): Set<string> {
    const parents = new Set<string>()
    for (const [nodeId, node] of this.nodes) {
      if (node.hasChild(id)) {
        parents.add(nodeId)
      }
    }
    return parents
  }

  addChildToMediaType(
    parentId: string,
    childId: string,
  ): void | MediaTypeNotFoundError | WillCreateCycleError {
    const parent = this.nodes.get(parentId)
    if (!parent) {
      return new MediaTypeNotFoundError(parentId)
    }

    const child = this.nodes.get(childId)
    if (!child) {
      return new MediaTypeNotFoundError(childId)
    }

    const cycle = this.hasPath(childId, parentId)
    if (cycle) {
      return new WillCreateCycleError([...cycle, childId])
    }

    parent.addChild(childId)
  }

  private hasPath(source: string, destination: string): string[] | undefined {
    const visited = new Set<string>()
    const path: string[] = []

    const dfs = (current: string): string[] | undefined => {
      if (current === destination) {
        return [...path, current]
      }

      visited.add(current)
      path.push(current)

      const neighbors = this.nodes.get(current)?.getChildren() ?? new Set<string>()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const cyclePath = dfs(neighbor)
          if (cyclePath) {
            return cyclePath
          }
        }
      }

      path.pop()
    }

    return dfs(source)
  }

  merge(
    sourceTree: MediaTypeTreeState,
    baseTree: MediaTypeTreeState,
  ): MediaTypeTreeEvent[] | MediaTypeAlreadyExistsError | WillCreateCycleError {
    const events: MediaTypeTreeEvent[] = []

    // 1. Handle media types that were added in sourceTree since baseTree
    for (const [id, node] of sourceTree.nodes) {
      if (!baseTree.nodes.has(id) && !this.nodes.has(id)) {
        // Media type was added in sourceTree and doesn't exist in the current tree
        this.nodes.set(id, MediaTypeNode.create(node.getName()))
        events.push(new MediaTypeAddedEvent(id, node.getName()))
      } else if (!baseTree.nodes.has(id) && this.nodes.has(id)) {
        // Media type was added in both trees independently - conflict
        return new MediaTypeAlreadyExistsError(id)
      }
    }

    // 2. Handle parent-child relationships
    for (const [id, node] of sourceTree.nodes) {
      if (!this.nodes.has(id)) {
        continue // Skip if media type doesn't exist in current tree
      }

      const baseChildren = baseTree.getMediaTypeChildren(id)
      const sourceChildren = node.getChildren()
      const currentChildren = this.getMediaTypeChildren(id)

      // Add new relationships from sourceTree
      for (const childId of sourceChildren) {
        if (!baseChildren.has(childId) && !currentChildren.has(childId)) {
          // Relationship was added in sourceTree and doesn't exist in current tree
          const error = this.addChildToMediaType(id, childId)
          if (error instanceof WillCreateCycleError) {
            return error
          } else if (error instanceof MediaTypeNotFoundError) {
            throw error // should never happen
          }

          events.push(new ParentAddedToMediaTypeEvent(childId, id))
        }
      }
    }

    return events
  }
}

class MediaTypeNode {
  private name: string
  private children: Set<string>

  private constructor(name: string, children: Set<string>) {
    this.name = name
    this.children = children
  }

  static create(name: string): MediaTypeNode {
    return new MediaTypeNode(name, new Set())
  }

  clone(): MediaTypeNode {
    return new MediaTypeNode(this.name, new Set([...this.children]))
  }

  getChildren(): Set<string> {
    return new Set(this.children)
  }

  hasChild(childId: string): boolean {
    return this.children.has(childId)
  }

  addChild(childId: string): void {
    this.children.add(childId)
  }

  getName(): string {
    return this.name
  }
}
