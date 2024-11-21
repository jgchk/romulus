import { CustomError } from '$lib/utils/error'

import { MediaTypeAlreadyExistsInBranchError } from './errors'
import { MediaTypeNotFoundInBranchError, WillCreateCycleInMediaTypeBranchError } from './errors'

export class MediaTypeBranch {
  private id: string
  private tree: MediaTypeTree

  private constructor(id: string, tree: MediaTypeTree) {
    this.id = id
    this.tree = tree
  }

  static create(id: string): MediaTypeBranch {
    return new MediaTypeBranch(id, MediaTypeTree.create())
  }

  static fromBranch(id: string, baseBranch: MediaTypeBranch): MediaTypeBranch {
    const newBranch = baseBranch.clone()
    newBranch.id = id
    return newBranch
  }

  clone(): MediaTypeBranch {
    return new MediaTypeBranch(this.id, this.tree.clone())
  }

  addMediaType(id: string): void | MediaTypeAlreadyExistsInBranchError {
    const error = this.tree.addMediaType(id)
    if (error instanceof MediaTypeAlreadyExistsError) {
      return new MediaTypeAlreadyExistsInBranchError(this.id, error.id)
    }
  }

  removeMediaType(id: string): void | MediaTypeNotFoundInBranchError {
    const error = this.tree.removeMediaType(id)
    if (error instanceof MediaTypeNotFoundError) {
      return new MediaTypeNotFoundInBranchError(this.id, error.id)
    }
  }

  addChildToMediaType(
    parentId: string,
    childId: string,
  ): void | MediaTypeNotFoundInBranchError | WillCreateCycleInMediaTypeBranchError {
    const error = this.tree.addChildToMediaType(parentId, childId)
    if (error instanceof MediaTypeNotFoundError) {
      return new MediaTypeNotFoundInBranchError(this.id, error.id)
    } else if (error instanceof WillCreateCycleError) {
      return new WillCreateCycleInMediaTypeBranchError(this.id, error.cycle)
    }
  }

  mergeInto(
    intoBranch: MediaTypeBranch,
  ): void | MediaTypeAlreadyExistsInBranchError | WillCreateCycleInMediaTypeBranchError {
    const error = this.tree.mergeInto(intoBranch.tree)
    if (error instanceof MediaTypeAlreadyExistsError) {
      return new MediaTypeAlreadyExistsInBranchError(intoBranch.id, error.id)
    } else if (error instanceof WillCreateCycleError) {
      return new WillCreateCycleInMediaTypeBranchError(intoBranch.id, error.cycle)
    }
  }
}

class MediaTypeTree {
  private nodes: Map<string, MediaTypeNode>

  private constructor(nodes: Map<string, MediaTypeNode>) {
    this.nodes = nodes
  }

  static create(): MediaTypeTree {
    return new MediaTypeTree(new Map())
  }

  clone(): MediaTypeTree {
    return new MediaTypeTree(
      new Map([...this.nodes.entries()].map(([id, node]) => [id, node.clone()])),
    )
  }

  hasMediaType(id: string): boolean {
    return this.nodes.has(id)
  }

  addMediaType(id: string): void | MediaTypeAlreadyExistsError {
    if (this.nodes.has(id)) {
      return new MediaTypeAlreadyExistsError(id)
    }

    this.nodes.set(id, MediaTypeNode.create())
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

  getMediaTypeChildren(id: string): Set<string> {
    return this.nodes.get(id)?.getChildren() ?? new Set()
  }

  getMediaTypeParents(id: string): Set<string> {
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

  mergeInto(intoTree: MediaTypeTree): void | MediaTypeAlreadyExistsError | WillCreateCycleError {
    for (const id of this.nodes.keys()) {
      const error = intoTree.addMediaType(id)
      if (error instanceof Error) {
        return error
      }
    }

    for (const [parentId, node] of this.nodes.entries()) {
      for (const childId of node.getChildren()) {
        const error = intoTree.addChildToMediaType(parentId, childId)
        if (error instanceof MediaTypeNotFoundError) {
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

class MediaTypeAlreadyExistsError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeAlreadyExistsError', `Media type already exists with id: ${id}`)
  }
}

class MediaTypeNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeNotFoundError', `Media type not found with id: ${id}`)
  }
}

class WillCreateCycleError extends CustomError {
  constructor(public readonly cycle: string[]) {
    super(
      'WillCreateCycleInMediaTypeTreeError',
      `Performing this operation will create a cycle in the media type tree: ${cycle.join(' -> ')}`,
    )
  }
}
