import { GenreCycleError } from './errors/genre-cycle'
import type { GenreTreeNode } from './genre-tree-node'

export class GenreTree {
  map: Map<number, { node: GenreTreeNode; status?: 'created' | 'updated' | 'deleted' }>

  constructor(nodes: GenreTreeNode[]) {
    this.map = new Map(nodes.map((node) => [node.id, { node }]))
  }

  insertGenre(node: GenreTreeNode): void {
    this.map.set(node.id, { node, status: 'created' })
  }

  updateGenre(node: GenreTreeNode): GenreCycleError | void {
    this.map.set(node.id, { node, status: 'updated' })

    const cycle = this.findCycle()
    if (cycle) {
      return new GenreCycleError(cycle)
    }
  }

  deleteGenre(id: number): void {
    this.moveGenreChildrenUnderParents(id)
    const genre = this.map.get(id)
    if (genre) {
      genre.status = 'deleted'
    }
  }

  getParents(id: number): Set<number> {
    const genre = this.map.get(id)
    return genre?.node.parents ?? new Set()
  }

  getDerivedFrom(id: number): Set<number> {
    const genre = this.map.get(id)
    return genre?.node.derivedFrom ?? new Set()
  }

  getInfluences(id: number): Set<number> {
    const genre = this.map.get(id)
    return genre?.node.influences ?? new Set()
  }

  private moveGenreChildrenUnderParents(id: number) {
    const genre = this.map.get(id)
    if (!genre) return

    const children = this.getGenreChildren(id)
    for (const childId of children) {
      const child = this.map.get(childId)
      if (!child) continue

      child.node.parents.delete(id)

      for (const parentId of genre.node.parents) {
        child.node.parents.add(parentId)
      }

      child.status = 'updated'
    }
  }

  getGenreChildren(id: number): Set<number> {
    const children = new Set<number>()

    for (const genre of this.map.values()) {
      if (genre.node.parents.has(id)) {
        children.add(genre.node.id)
      }
    }

    return children
  }

  private findCycle(): string | undefined {
    for (const genre of [...this.map.values()].filter((node) => node.status !== 'deleted')) {
      const cycle = this.findCycleInner(genre.node.id, [])
      if (cycle) {
        const formattedCycle = cycle.map((id) => this.map.get(id)!.node.name).join(' → ')
        return formattedCycle
      }
    }
  }

  private findCycleInner(id: number, stack: number[]): number[] | false {
    if (stack.includes(id)) {
      return [...stack, id]
    }

    const genre = this.map.get(id)
    if (!genre || genre.status === 'deleted') return false

    for (const parentId of genre.node.parents) {
      const cycle = this.findCycleInner(parentId, [...stack, id])
      if (cycle) {
        return cycle
      }
    }

    for (const derivedFromId of genre.node.derivedFrom) {
      const cycle = this.findCycleInner(derivedFromId, [...stack, id])
      if (cycle) {
        return cycle
      }
    }

    return false
  }
}
