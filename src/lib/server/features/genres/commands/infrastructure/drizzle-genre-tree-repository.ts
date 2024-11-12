import type { IDrizzleConnection } from '$lib/server/db/connection'
import { genreDerivedFrom, genreInfluences, genreParents } from '$lib/server/db/schema'

import { GenreTree } from '../domain/genre-tree'
import type { GenreTreeRepository } from '../domain/genre-tree-repository'

export class DrizzleGenreTreeRepository implements GenreTreeRepository {
  constructor(private db: IDrizzleConnection) {}

  async get(): Promise<GenreTree> {
    const nodes = await this.db.query.genres.findMany({
      columns: {
        id: true,
        name: true,
      },
      with: {
        parents: { columns: { parentId: true } },
        derivedFrom: { columns: { derivedFromId: true } },
        influencedBy: { columns: { influencerId: true } },
      },
    })

    const tree = new GenreTree(
      nodes.map((node) => ({
        id: node.id,
        name: node.name,
        parents: new Set(node.parents.map((p) => p.parentId)),
        derivedFrom: new Set(node.derivedFrom.map((df) => df.derivedFromId)),
        influences: new Set(node.influencedBy.map((i) => i.influencerId)),
      })),
    )

    return tree
  }

  async save(genreTree: GenreTree): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(genreParents)
      const parentChildNodes = [...genreTree.map.values()].flatMap((node) =>
        [...node.parents].map((parentId) => ({ parentId, childId: node.id })),
      )
      if (parentChildNodes.length > 0) {
        await tx.insert(genreParents).values(parentChildNodes)
      }

      await tx.delete(genreDerivedFrom)
      const derivedFromNodes = [...genreTree.map.values()].flatMap((node) =>
        [...node.derivedFrom].map((derivedFromId) => ({ derivedFromId, derivationId: node.id })),
      )
      if (derivedFromNodes.length > 0) {
        await tx.insert(genreDerivedFrom).values(derivedFromNodes)
      }

      await tx.delete(genreInfluences)
      const influenceNodes = [...genreTree.map.values()].flatMap((node) =>
        [...node.influences].map((influencerId) => ({ influencerId, influencedId: node.id })),
      )
      if (influenceNodes.length > 0) {
        await tx.insert(genreInfluences).values(influenceNodes)
      }
    })
  }
}
