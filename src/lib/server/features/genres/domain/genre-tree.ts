import type { Genre } from './genre'

export class GenreTree {
  private map: Map<number, GenreTreeNode>

  constructor(nodes: GenreTreeNode[]) {
    this.map = new Map(nodes.map((node) => [node.id, node]))
  }

  updateGenre(id: number, genre: Genre) {
    this.map.set(id, new GenreTreeNode(id, genre.name, genre.parents))
  }

  findCycle(): string | undefined {
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
