import {
  MediaTypeAlreadyExistsError,
  MediaTypeNameInvalidError,
  MediaTypeNotFoundError,
  WillCreateCycleError,
} from './errors'

export type TreeStateEvent =
  | MediaTypeAddedEvent
  | MediaTypeRemovedEvent
  | ParentAddedToMediaTypeEvent
  | MediaTypeTreesMergedEvent

export class MediaTypeAddedEvent {
  constructor(
    public readonly mediaTypeId: string,
    public readonly name: string,
  ) {}
}

export class MediaTypeRemovedEvent {
  constructor(public readonly mediaTypeId: string) {}
}

export class ParentAddedToMediaTypeEvent {
  constructor(
    public readonly parentId: string,
    public readonly childId: string,
  ) {}
}

export class MediaTypeTreesMergedEvent {
  constructor(
    public readonly sourceTree: TreeState,
    public readonly baseTree: TreeState,
  ) {}
}

export class TreeState {
  private nodes: Map<string, MediaTypeNode>

  private constructor(nodes: Map<string, MediaTypeNode>) {
    this.nodes = nodes
  }

  static create(): TreeState {
    return new TreeState(new Map())
  }

  clone(): TreeState {
    return new TreeState(new Map([...this.nodes.entries()].map(([id, node]) => [id, node.clone()])))
  }

  applyEvent(event: TreeStateEvent): void {
    if (event instanceof MediaTypeAddedEvent) {
      const error = this.addMediaType(event.mediaTypeId, event.name)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeRemovedEvent) {
      const error = this.removeMediaType(event.mediaTypeId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof ParentAddedToMediaTypeEvent) {
      const error = this.addChildToMediaType(event.parentId, event.childId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeTreesMergedEvent) {
      const error = this.merge(event.sourceTree, event.baseTree)
      if (error instanceof Error) {
        throw error
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = event
    }
  }

  addMediaType(
    id: string,
    name: string,
  ): MediaTypeNode | MediaTypeAlreadyExistsError | MediaTypeNameInvalidError {
    if (this.nodes.has(id)) {
      return new MediaTypeAlreadyExistsError(id)
    }

    const node = MediaTypeNode.create(name)
    if (node instanceof MediaTypeNameInvalidError) {
      return node
    }

    this.nodes.set(id, node)

    return node
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
    sourceTree: TreeState,
    baseTree: TreeState,
  ): void | MediaTypeAlreadyExistsError | WillCreateCycleError {
    // 1. Handle media types that were added in sourceTree since baseTree
    for (const [id, node] of sourceTree.nodes) {
      if (!baseTree.nodes.has(id) && !this.nodes.has(id)) {
        // Media type was added in sourceTree and doesn't exist in the current tree
        this.nodes.set(id, node.cloneWithoutChildren())
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
        }
      }
    }
  }
}

class MediaTypeNode {
  private name: MediaTypeName
  private children: Set<string>

  private constructor(name: MediaTypeName, children: Set<string>) {
    this.name = name
    this.children = children
  }

  static create(name: string): MediaTypeNode | MediaTypeNameInvalidError {
    const mediaTypeName = MediaTypeName.create(name)
    if (mediaTypeName instanceof MediaTypeNameInvalidError) {
      return mediaTypeName
    }

    return new MediaTypeNode(mediaTypeName, new Set())
  }

  clone(): MediaTypeNode {
    return new MediaTypeNode(this.name, new Set([...this.children]))
  }

  cloneWithoutChildren(): MediaTypeNode {
    return new MediaTypeNode(this.name, new Set())
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
    return this.name.toString()
  }
}

class MediaTypeName {
  private constructor(private readonly value: string) {}

  static create(name: string): MediaTypeName | MediaTypeNameInvalidError {
    const trimmedName = name.trim().replace(/\n/g, '')
    if (trimmedName.length === 0) {
      return new MediaTypeNameInvalidError(name)
    }
    return new MediaTypeName(trimmedName)
  }

  toString(): string {
    return this.value
  }
}
