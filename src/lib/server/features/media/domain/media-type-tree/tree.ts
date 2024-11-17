import { CustomError } from '$lib/utils/error'

import { type MediaTypeTreeNode } from './tree-node'

export class MediaTypeTree {
  private nodes: Map<number, MediaTypeTreeNode>

  constructor() {
    this.nodes = new Map()
  }

  insert(node: MediaTypeTreeNode): void | MediaTypeAlreadyExistsError {
    if (this.nodes.has(node.id)) {
      return new MediaTypeAlreadyExistsError(node.id)
    }

    this.nodes.set(node.id, node)
  }

  addParent(id: number, parentId: number): void | MediaTypeNotFoundError | CycleError {
    const node = this.nodes.get(id)
    if (node === undefined) {
      return new MediaTypeNotFoundError(id)
    }

    const parentNode = this.nodes.get(parentId)
    if (parentNode === undefined) {
      return new MediaTypeNotFoundError(parentId)
    }

    parentNode.addChild(id)

    const cycle = this.findCycle()
    if (cycle) {
      return new CycleError(cycle)
    }
  }

  get(id: number): MediaTypeTreeNode | undefined {
    return this.nodes.get(id)
  }

  getAll(): MediaTypeTreeNode[] {
    return [...this.nodes.values()]
  }

  private findCycle(): number[] | undefined {
    const finished = new Set<number>()

    const dfs = (v: number, stack: number[]): number[] | undefined => {
      if (finished.has(v)) {
        return undefined
      }

      if (stack.includes(v)) {
        const cycleStart = stack.lastIndexOf(v)
        return [...stack.slice(cycleStart), v]
      }

      for (const child of this.nodes.get(v)?.getChildren() ?? new Set()) {
        const cycle = dfs(child, [...stack, v])
        if (cycle) {
          return cycle
        }
      }

      finished.add(v)
      return undefined
    }

    for (const node of this.nodes.values()) {
      const cycle = dfs(node.id, [])
      if (cycle) return cycle
    }

    return undefined
  }
}

export class MediaTypeAlreadyExistsError extends CustomError {
  constructor(public readonly id: number) {
    super('MediaTypeAlreadyExistsError', `A media type already exists with id: ${id}`)
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
