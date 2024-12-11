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
      this.addMediaType(event.mediaTypeId, event.name)
    } else if (event instanceof MediaTypeRemovedEvent) {
      this.removeMediaType(event.mediaTypeId)
    } else if (event instanceof ParentAddedToMediaTypeEvent) {
      this.addChildToMediaType(event.parentId, event.childId)
    } else if (event instanceof MediaTypeTreesMergedEvent) {
      this.merge(event.sourceTree, event.baseTree)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = event
    }
  }

  addMediaType(id: string, name: string): void {
    const node = MediaTypeNode.create(name)
    this.nodes.set(id, node)
  }

  removeMediaType(id: string): void {
    this.moveChildrenUnderParents(id)
    this.removeMediaTypeFromParents(id)
    this.nodes.delete(id)
  }

  private removeMediaTypeFromParents(id: string): void {
    const parentIds = this.getMediaTypeParents(id)
    for (const parentId of parentIds) {
      const parent = this.nodes.get(parentId)
      if (!parent) continue
      parent.removeChild(id)
    }
  }

  private moveChildrenUnderParents(id: string): void {
    const childIds = this.getMediaTypeChildren(id)
    const parentIds = this.getMediaTypeParents(id)

    for (const parentId of parentIds) {
      for (const childId of childIds) {
        this.addChildToMediaType(parentId, childId)
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

  addChildToMediaType(parentId: string, childId: string): void {
    const parent = this.nodes.get(parentId)
    if (!parent) return

    const child = this.nodes.get(childId)
    if (!child) return

    parent.addChild(childId)
  }

  merge(sourceTree: TreeState, baseTree: TreeState): void {
    // 1. Handle media types that were added in sourceTree since baseTree
    for (const [id, node] of sourceTree.nodes) {
      if (!baseTree.nodes.has(id) && !this.nodes.has(id)) {
        // Media type was added in sourceTree and doesn't exist in the current tree
        this.nodes.set(id, node.cloneWithoutChildren())
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
          this.addChildToMediaType(id, childId)
        }
      }
    }
  }

  getNodes(): Map<string, MediaTypeNode> {
    return new Map(this.nodes)
  }

  marshal() {
    return new Map([...this.nodes.entries()].map(([id, node]) => [id, node.marshal()]))
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

  removeChild(childId: string): void {
    this.children.delete(childId)
  }

  getName(): string {
    return this.name.toString()
  }

  marshal() {
    return { children: new Set(this.children) }
  }
}
