import { CustomError } from '$lib/utils/error'

import { MediaTypeAddedEvent, MediaTypeParentAddedEvent, type MediaTypeTreeEvent } from './events'
import { MediaTypeTreeNode } from './tree-node'

export class MediaTypeTree {
  private currId: number
  private nodes: Map<number, MediaTypeTreeNode>

  private constructor(currId: number, nodes: Map<number, MediaTypeTreeNode>) {
    this.currId = currId
    this.nodes = nodes
  }

  static create(): MediaTypeTree {
    return new MediaTypeTree(0, new Map())
  }

  clone(): MediaTypeTree {
    return new MediaTypeTree(this.currId, new Map(structuredClone(this.nodes)))
  }

  apply(event: MediaTypeTreeEvent): void {
    if (event instanceof MediaTypeAddedEvent) {
      const treeNode = MediaTypeTreeNode.create(event.id)
      this.currId = treeNode.id
      this.nodes.set(treeNode.id, treeNode)
    } else if (event instanceof MediaTypeParentAddedEvent) {
      const parentNode = this.nodes.get(event.parentId)
      if (parentNode === undefined) {
        throw new Error(`A media type was not found for id: ${event.parentId}`)
      }

      const childNode = this.nodes.get(event.childId)
      if (childNode === undefined) {
        throw new Error(`A media type was not found for id: ${event.childId}`)
      }

      parentNode.addChild(childNode.id)
    }
  }

  addMediaType(): MediaTypeAddedEvent {
    const id = this.currId + 1
    const event = new MediaTypeAddedEvent(id)

    this.apply(event)

    return event
  }

  addParentToMediaType(
    id: number,
    parentId: number,
  ): MediaTypeParentAddedEvent | MediaTypeNotFoundError | CycleError {
    const node = this.nodes.get(id)
    if (node === undefined) {
      return new MediaTypeNotFoundError(id)
    }

    const parentNode = this.nodes.get(parentId)
    if (parentNode === undefined) {
      return new MediaTypeNotFoundError(parentId)
    }

    const cycle = this.wouldHaveCycle(id, parentId)
    if (cycle) {
      return new CycleError(cycle)
    }

    const event = new MediaTypeParentAddedEvent(id, parentId)

    this.apply(event)

    return event
  }

  get(id: number): MediaTypeTreeNode | undefined {
    return this.nodes.get(id)
  }

  getAll(): MediaTypeTreeNode[] {
    return [...this.nodes.values()]
  }

  private wouldHaveCycle(childId: number, parentId: number): number[] | undefined {
    const finished = new Set<number>()

    const dfs = (v: number, stack: number[]): number[] | undefined => {
      if (finished.has(v)) {
        return undefined
      }

      if (stack.includes(v)) {
        const cycleStart = stack.lastIndexOf(v)
        return [...stack.slice(cycleStart), v]
      }

      const children = this.nodes.get(v)?.getChildren() ?? new Set()
      if (v === parentId) {
        children.add(childId)
      }

      for (const child of children) {
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
