import {
  MediaTypeAlreadyExistsError,
  MediaTypeNameInvalidError,
  MediaTypeNotFoundError,
  MediaTypeTreeNameInvalidError,
  WillCreateCycleError,
} from './errors'
import {
  MediaTypeAddedEvent,
  MediaTypeRemovedEvent,
  type MediaTypeTreeEvent,
  MediaTypeTreeNamedEvent,
  MediaTypeTreesMergedEvent,
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

  static copyEvents(events: MediaTypeTreeEvent[]): MediaTypeTree {
    const tree = new MediaTypeTree(MediaTypeTreeState.create(), [])
    for (const event of events) {
      tree.applyEvent(event)
      tree.addEvent(event)
    }
    return tree
  }

  getUncommittedEvents(): MediaTypeTreeEvent[] {
    return [...this.uncommittedEvents]
  }

  private applyEvent(event: MediaTypeTreeEvent): void {
    if (event instanceof MediaTypeTreeNamedEvent) {
      // nothing to do here
    } else if (event instanceof MediaTypeAddedEvent) {
      const error = this.state.tree.addMediaType(event.id, event.name)
      if (error instanceof Error) {
        throw error
      }

      this.state.addCommit(event.commitId)
    } else if (event instanceof MediaTypeRemovedEvent) {
      const error = this.state.tree.removeMediaType(event.id)
      if (error instanceof Error) {
        throw error
      }

      this.state.addCommit(event.commitId)
    } else if (event instanceof ParentAddedToMediaTypeEvent) {
      const error = this.state.tree.addChildToMediaType(event.parentId, event.childId)
      if (error instanceof Error) {
        throw error
      }

      this.state.addCommit(event.commitId)
    } else if (event instanceof MediaTypeTreesMergedEvent) {
      const error = this.state.tree.replayMerge(event.changes)
      if (error instanceof Error) {
        throw error
      }

      this.state.addCommit(event.commitId)
    } else {
      // exhaustive check
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = event
    }
  }

  private addEvent(event: MediaTypeTreeEvent): void {
    this.uncommittedEvents.push(event)
  }

  setName(name: string): void | MediaTypeTreeNameInvalidError {
    const trimmedName = name.trim().replace(/\n/g, '')
    if (trimmedName.length === 0) {
      return new MediaTypeTreeNameInvalidError(name)
    }

    const event = new MediaTypeTreeNamedEvent(trimmedName)

    this.applyEvent(event)
    this.addEvent(event)
  }

  addMediaType(
    id: string,
    name: string,
  ): void | MediaTypeAlreadyExistsError | MediaTypeNameInvalidError {
    const trimmedName = name.trim().replace(/\n/g, '')
    if (trimmedName.length === 0) {
      return new MediaTypeNameInvalidError(name)
    }

    const error = this.state.tree.clone().addMediaType(id, trimmedName)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeAddedEvent(id, trimmedName)

    this.applyEvent(event)
    this.addEvent(event)
  }

  removeMediaType(id: string): void | MediaTypeNotFoundError {
    const error = this.state.tree.clone().removeMediaType(id)
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
    const error = this.state.tree.clone().addChildToMediaType(parentId, childId)
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
      baseTree === undefined ? MediaTypeTreeTreeState.create() : baseTree.state.tree.clone()
    const changes = this.state.tree.clone().merge(sourceTree.state.tree.clone(), baseTreeState)
    if (changes instanceof Error) {
      return changes
    }

    if (changes.length === 0) {
      return
    }

    const event = new MediaTypeTreesMergedEvent(changes)

    this.applyEvent(event)
    this.addEvent(event)
  }

  getCommonCommits(other: MediaTypeTree): string[] {
    return this.state.getCommonCommits(other.state)
  }
}

class MediaTypeTreeState {
  tree: MediaTypeTreeTreeState
  private commit: Commit | undefined

  private constructor(tree: MediaTypeTreeTreeState, commit: Commit | undefined) {
    this.tree = tree
    this.commit = commit
  }

  static create(): MediaTypeTreeState {
    return new MediaTypeTreeState(MediaTypeTreeTreeState.create(), undefined)
  }

  addCommit(commitId: string): void {
    const parents = []
    if (this.commit) {
      parents.push(this.commit)
    }

    const newCommit = new Commit(commitId, parents)
    this.commit = newCommit
  }

  getCommonCommits(other: MediaTypeTreeState): string[] {
    const otherCommits = other.getAllCommits()
    const otherCommitIds = new Set(otherCommits.map((commit) => commit.id))

    const commonCommitIds: string[] = []
    for (const commit of this.getAllCommits()) {
      if (otherCommitIds.has(commit.id)) {
        commonCommitIds.push(commit.id)
      }
    }

    return commonCommitIds
  }

  getAllCommits(): Commit[] {
    if (!this.commit) {
      return []
    }

    const commits: Commit[] = []

    const queue = [this.commit]
    while (queue.length > 0) {
      const current = queue.shift()!
      commits.push(current)
      queue.push(...current.parents)
    }

    return commits.reverse()
  }
}

class Commit {
  id: string
  parents: Commit[]

  constructor(id: string, parents: Commit[]) {
    this.id = id
    this.parents = parents
  }

  clone(): Commit {
    return new Commit(this.id, [...this.parents])
  }
}

class MediaTypeTreeTreeState {
  private nodes: Map<string, MediaTypeNode>

  private constructor(nodes: Map<string, MediaTypeNode>) {
    this.nodes = nodes
  }

  static create(): MediaTypeTreeTreeState {
    return new MediaTypeTreeTreeState(new Map())
  }

  clone(): MediaTypeTreeTreeState {
    return new MediaTypeTreeTreeState(
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
    sourceTree: MediaTypeTreeTreeState,
    baseTree: MediaTypeTreeTreeState,
  ): MediaTypeTreesMergedEvent['changes'] | MediaTypeAlreadyExistsError | WillCreateCycleError {
    const events: MediaTypeTreesMergedEvent['changes'] = []

    // 1. Handle media types that were added in sourceTree since baseTree
    for (const [id, node] of sourceTree.nodes) {
      if (!baseTree.nodes.has(id) && !this.nodes.has(id)) {
        // Media type was added in sourceTree and doesn't exist in the current tree
        this.nodes.set(id, MediaTypeNode.create(node.getName()))
        events.push({ action: 'added', id, name: node.getName() })
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

          events.push({ action: 'parent-added', childId, parentId: id })
        }
      }
    }

    return events
  }

  replayMerge(
    events: MediaTypeTreesMergedEvent['changes'],
  ): void | MediaTypeAlreadyExistsError | MediaTypeNotFoundError | WillCreateCycleError {
    for (const change of events) {
      if (change.action === 'added') {
        const error = this.addMediaType(change.id, change.name)
        if (error instanceof Error) {
          return error
        }
      } else if (change.action === 'removed') {
        const error = this.removeMediaType(change.id)
        if (error instanceof Error) {
          return error
        }
      } else if (change.action === 'parent-added') {
        const error = this.addChildToMediaType(change.parentId, change.childId)
        if (error instanceof Error) {
          return error
        }
      } else {
        // exhaustive check
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustiveCheck: never = change
      }
    }
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
