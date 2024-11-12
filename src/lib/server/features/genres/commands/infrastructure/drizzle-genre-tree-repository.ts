import { eq } from 'drizzle-orm'

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
      for (const node of genreTree.map.values()) {
        if (node.status === 'created') {
          const parents = [...node.parents].map((parentId) => ({ parentId, childId: node.id }))
          if (parents.length > 0) {
            await tx.insert(genreParents).values(parents)
          }

          const derivedFrom = [...node.derivedFrom].map((derivedFromId) => ({
            derivedFromId,
            derivationId: node.id,
          }))
          if (derivedFrom.length > 0) {
            await tx.insert(genreDerivedFrom).values(derivedFrom)
          }

          const influences = [...node.influences].map((influencerId) => ({
            influencerId,
            influencedId: node.id,
          }))
          if (influences.length > 0) {
            await tx.insert(genreInfluences).values(influences)
          }
        } else if (node.status === 'updated') {
          await tx.delete(genreParents).where(eq(genreParents.childId, node.id))
          const parents = [...node.parents].map((parentId) => ({ parentId, childId: node.id }))
          if (parents.length > 0) {
            await tx.insert(genreParents).values(parents)
          }

          await tx.delete(genreDerivedFrom).where(eq(genreDerivedFrom.derivationId, node.id))
          const derivedFrom = [...node.derivedFrom].map((derivedFromId) => ({
            derivedFromId,
            derivationId: node.id,
          }))
          if (derivedFrom.length > 0) {
            await tx.insert(genreDerivedFrom).values(derivedFrom)
          }

          await tx.delete(genreInfluences).where(eq(genreInfluences.influencedId, node.id))
          const influences = [...node.influences].map((influencerId) => ({
            influencerId,
            influencedId: node.id,
          }))
          if (influences.length > 0) {
            await tx.insert(genreInfluences).values(influences)
          }
        } else if (node.status === 'deleted') {
          await tx.delete(genreParents).where(eq(genreParents.childId, node.id))
          await tx.delete(genreDerivedFrom).where(eq(genreDerivedFrom.derivationId, node.id))
          await tx.delete(genreInfluences).where(eq(genreInfluences.influencedId, node.id))
        }
      }
    })
  }
}
