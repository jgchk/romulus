import { err, ok, type Result } from 'neverthrow'

import { GenreCycleError } from './errors/genre-cycle.js'
import { type GenreTreeNode } from './genre-tree-node.js'

export class GenreTree {
  map: Map<number, { node: GenreTreeNode; status?: 'created' | 'updated' | 'deleted' }>

  constructor(nodes: GenreTreeNode[]) {
    this.map = new Map(nodes.map((node) => [node.id, { node }]))
  }

  insertGenre(node: GenreTreeNode): void {
    this.map.set(node.id, { node, status: 'created' })
  }

  updateGenre(node: GenreTreeNode): Result<void, GenreCycleError> {
    this.map.set(node.id, { node, status: 'updated' })

    for (const parentId of [...node.parents, ...node.derivedFrom]) {
      const cycle = this.hasPath(parentId, node.id)
      if (cycle) {
        const formattedCycle = [...cycle, node.id]
          .map((id) => this.map.get(id)!.node.name)
          .join(' → ')
        return err(new GenreCycleError(formattedCycle))
      }
    }

    return ok(undefined)
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

  hasPath(source: number, destination: number): number[] | undefined {
    const visited = new Set<number>()
    const path: number[] = []

    const dfs = (current: number): number[] | undefined => {
      if (current === destination) {
        return [...path, current].reverse()
      }

      visited.add(current)
      path.push(current)

      const genre = this.map.get(current)
      const neighbors =
        genre?.status === 'deleted'
          ? []
          : new Set([...(genre?.node.parents ?? []), ...(genre?.node.derivedFrom ?? [])])
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
}
