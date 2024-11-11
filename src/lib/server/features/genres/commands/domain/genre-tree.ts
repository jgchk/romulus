import { GenreCycleError } from './errors/genre-cycle'
import type { Genre } from './genre'

export class GenreTree {
  map: Map<number, GenreTreeNode>

  constructor(nodes: GenreTreeNode[]) {
    this.map = new Map(nodes.map((node) => [node.id, node]))
  }

  insertGenre(genre: Genre): GenreCycleError | undefined {
    const id = -1
    this.map.set(id, new GenreTreeNode(id, genre.name, genre.parents))

    const cycle = this.findCycle()
    if (cycle) {
      return new GenreCycleError(cycle)
    }
  }

  updateGenre(id: number, genre: Genre): GenreCycleError | undefined {
    this.map.set(id, new GenreTreeNode(id, genre.name, genre.parents))

    const cycle = this.findCycle()
    if (cycle) {
      return new GenreCycleError(cycle)
    }
  }

  deleteGenre(id: number): GenreCycleError | undefined {
    this.moveGenreChildrenUnderParents(id)
    this.map.delete(id)

    const cycle = this.findCycle()
    if (cycle) {
      return new GenreCycleError(cycle)
    }
  }

  private moveGenreChildrenUnderParents(id: number) {
    const genre = this.map.get(id)
    if (!genre) return

    const children = this.getGenreChildren(id)
    for (const childId of children) {
      const child = this.map.get(childId)
      if (!child) continue

      child.parents.delete(id)

      for (const parentId of genre.parents) {
        child.parents.add(parentId)
      }
    }
  }

  getGenreChildren(id: number): Set<number> {
    const children = new Set<number>()

    for (const node of this.map.values()) {
      if (node.parents.has(id)) {
        children.add(node.id)
      }
    }

    return children
  }

  private findCycle(): string | undefined {
    for (const genre of this.map.values()) {
      const cycle = this.findCycleInner(genre.id, [])
      if (cycle) {
        const formattedCycle = cycle.map((id) => this.map.get(id)!.name).join(' → ')
        return formattedCycle
      }
    }
  }

  private findCycleInner(id: number, stack: number[]): number[] | false {
    if (stack.includes(id)) {
      return [...stack, id]
    }

    const genre = this.map.get(id)
    if (!genre) return false

    for (const parentId of genre.parents) {
      const cycle = this.findCycleInner(parentId, [...stack, id])
      if (cycle) {
        return cycle
      }
    }

    return false
  }
}

class GenreTreeNode {
  constructor(
    public id: number,
    public name: string,
    public parents: Set<number>,
  ) {}
}
