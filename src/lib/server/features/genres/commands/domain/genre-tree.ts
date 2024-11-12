import { intersection } from 'ramda'

import { DerivedChildError } from './errors/derived-child'
import { DerivedInfluenceError } from './errors/derived-influence'
import { GenreCycleError } from './errors/genre-cycle'
import { SelfInfluenceError } from './errors/self-influence'

export class GenreTree {
  map: Map<number, GenreTreeNode>

  constructor(nodes: GenreTreeNode[]) {
    this.map = new Map(nodes.map((node) => [node.id, node]))
  }

  insertGenre(
    id: number,
    name: string,
    parents: Set<number>,
    derivedFrom: Set<number>,
    influences: Set<number>,
  ): GenreCycleError | DerivedChildError | DerivedInfluenceError | SelfInfluenceError | undefined {
    const isDerivedAndChild = intersection([...parents], [...derivedFrom]).length > 0
    if (isDerivedAndChild) {
      return new DerivedChildError(id)
    }

    const isDerivedAndInfluence = intersection([...derivedFrom], [...influences]).length > 0
    if (isDerivedAndInfluence) {
      return new DerivedInfluenceError(id)
    }

    const influencesSelf = influences.has(id)
    if (influencesSelf) {
      return new SelfInfluenceError()
    }

    this.map.set(id, new GenreTreeNode(id, name, parents, derivedFrom, influences))

    const cycle = this.findCycle()
    if (cycle) {
      return new GenreCycleError(cycle)
    }
  }

  updateGenre(
    id: number,
    name: string,
    parents: Set<number>,
    derivedFrom: Set<number>,
    influences: Set<number>,
  ): GenreCycleError | DerivedChildError | DerivedInfluenceError | SelfInfluenceError | undefined {
    const isDerivedAndChild = intersection([...parents], [...derivedFrom]).length > 0
    if (isDerivedAndChild) {
      return new DerivedChildError(id)
    }

    const isDerivedAndInfluence = intersection([...derivedFrom], [...influences]).length > 0
    if (isDerivedAndInfluence) {
      return new DerivedInfluenceError(id)
    }

    const influencesSelf = influences.has(id)
    if (influencesSelf) {
      return new SelfInfluenceError()
    }

    this.map.set(id, new GenreTreeNode(id, name, parents, derivedFrom, influences))

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

  getParents(id: number): Set<number> {
    const genre = this.map.get(id)
    return genre?.parents ?? new Set()
  }

  getDerivedFrom(id: number): Set<number> {
    const genre = this.map.get(id)
    return genre?.derivedFrom ?? new Set()
  }

  getInfluences(id: number): Set<number> {
    const genre = this.map.get(id)
    return genre?.influences ?? new Set()
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

    for (const derivedFromId of genre.derivedFrom) {
      const cycle = this.findCycleInner(derivedFromId, [...stack, id])
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
    public derivedFrom: Set<number>,
    public influences: Set<number>,
  ) {}
}
