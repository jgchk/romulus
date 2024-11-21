import {
  MediaTypeAlreadyExistsInBranchError,
  MediaTypeNotFoundInBranchError,
  WillCreateCycleInMediaTypeTreeError,
} from './errors'

export class MediaTypeBranch {
  private id: string
  private nodes: Map<string, MediaTypeNode>

  private constructor(id: string, nodes: Map<string, MediaTypeNode>) {
    this.id = id
    this.nodes = nodes
  }

  static create(id: string): MediaTypeBranch {
    return new MediaTypeBranch(id, new Map())
  }

  static fromBranch(id: string, baseBranch: MediaTypeBranch): MediaTypeBranch {
    const newBranch = baseBranch.clone()
    newBranch.id = id
    return newBranch
  }

  clone(): MediaTypeBranch {
    return new MediaTypeBranch(
      this.id,
      new Map([...this.nodes.entries()].map(([id, node]) => [id, node.clone()])),
    )
  }

  addMediaType(id: string): void | MediaTypeAlreadyExistsInBranchError {
    if (this.nodes.has(id)) {
      return new MediaTypeAlreadyExistsInBranchError(this.id, id)
    }

    this.addMediaTypeWithoutDuplicateCheck(id)
  }

  private addMediaTypeWithoutDuplicateCheck(id: string) {
    this.nodes.set(id, MediaTypeNode.create())
  }

  removeMediaType(id: string): void | MediaTypeNotFoundInBranchError {
    const error = this.moveChildrenUnderParents(id)
    if (error instanceof Error) {
      return error
    }

    this.nodes.delete(id)
  }

  private moveChildrenUnderParents(id: string): void | MediaTypeNotFoundInBranchError {
    const node = this.nodes.get(id)
    if (!node) {
      return new MediaTypeNotFoundInBranchError(this.id, id)
    }

    const childIds = node.getChildren()
    const parentIds = this.getMediaTypeParents(id)

    for (const parentId of parentIds) {
      for (const childId of childIds) {
        const error = this.addMediaTypeChildWithoutCycleCheck(parentId, childId)
        if (error instanceof Error) {
          return error
        }
      }
    }
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
  ): void | MediaTypeNotFoundInBranchError | WillCreateCycleInMediaTypeTreeError {
    const cycle = this.hasPath(childId, parentId)
    if (cycle) {
      return new WillCreateCycleInMediaTypeTreeError(this.id, [...cycle, childId])
    }

    return this.addMediaTypeChildWithoutCycleCheck(parentId, childId)
  }

  private addMediaTypeChildWithoutCycleCheck(
    parentId: string,
    childId: string,
  ): void | MediaTypeNotFoundInBranchError {
    const parent = this.nodes.get(parentId)
    if (!parent) {
      return new MediaTypeNotFoundInBranchError(this.id, parentId)
    }

    const child = this.nodes.get(childId)
    if (!child) {
      return new MediaTypeNotFoundInBranchError(this.id, childId)
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

  mergeInto(intoBranch: MediaTypeBranch): void | WillCreateCycleInMediaTypeTreeError {
    for (const id of this.nodes.keys()) {
      if (!intoBranch.nodes.has(id)) {
        intoBranch.addMediaTypeWithoutDuplicateCheck(id)
      }
    }

    for (const [parentId, node] of this.nodes.entries()) {
      for (const childId of node.getChildren()) {
        const error = intoBranch.addChildToMediaType(parentId, childId)
        if (error instanceof MediaTypeNotFoundInBranchError) {
          throw error // should never happen since we added all media types above
        } else if (error instanceof Error) {
          return error
        }
      }
    }
  }
}

class MediaTypeNode {
  private children: Set<string>

  private constructor(children: Set<string>) {
    this.children = children
  }

  static create(): MediaTypeNode {
    return new MediaTypeNode(new Set())
  }

  clone(): MediaTypeNode {
    return new MediaTypeNode(new Set([...this.children]))
  }

  addChild(childId: string): void {
    this.children.add(childId)
  }

  getChildren(): Set<string> {
    return new Set(this.children)
  }

  hasChild(childId: string): boolean {
    return this.children.has(childId)
  }
}
