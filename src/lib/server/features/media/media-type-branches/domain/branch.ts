import {
  MediaTypeAlreadyExistsInBranchError,
  MediaTypeNotFoundInBranchError,
  WillCreateCycleInMediaTypeTreeError,
} from './errors'

export class MediaTypeBranch {
  private id: string
  private nodes: Map<string, { children: Set<string> }>

  private constructor(id: string, nodes: Map<string, { children: Set<string> }>) {
    this.id = id
    this.nodes = nodes
  }

  static create(id: string): MediaTypeBranch {
    return new MediaTypeBranch(id, new Map())
  }

  clone(): MediaTypeBranch {
    return new MediaTypeBranch(this.id, new Map(structuredClone(this.nodes)))
  }

  addMediaType(id: string): void | MediaTypeAlreadyExistsInBranchError {
    if (this.nodes.has(id)) {
      return new MediaTypeAlreadyExistsInBranchError(this.id, id)
    }

    this.addMediaTypeWithoutDuplicateCheck(id)
  }

  private addMediaTypeWithoutDuplicateCheck(id: string) {
    this.nodes.set(id, { children: new Set() })
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

    const childIds = node.children
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
      if (node.children.has(id)) {
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

    parent.children.add(childId)
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

      const neighbors = this.nodes.get(current)?.children ?? new Set<string>()
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

  mergeInto(
    intoBranch: MediaTypeBranch,
  ): void | MediaTypeNotFoundInBranchError | WillCreateCycleInMediaTypeTreeError {
    for (const mediaTypeId of this.nodes.keys()) {
      if (!intoBranch.nodes.has(mediaTypeId)) {
        intoBranch.addMediaTypeWithoutDuplicateCheck(mediaTypeId)
      }
    }

    for (const [mediaTypeId, node] of this.nodes) {
      for (const childId of node.children) {
        const error = intoBranch.addChildToMediaType(mediaTypeId, childId)
        if (error instanceof Error) {
          return error
        }
      }
    }
  }
}
