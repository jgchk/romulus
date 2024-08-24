import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { genreAkas, genreInfluences, genreParents, genres } from '$lib/server/db/schema'

import { Genre } from '../../domain/genre'
import { GenreTree } from '../../domain/genre-tree'
import type { GenreRepository } from './genre-repository'

export class DrizzleGenreRepository implements GenreRepository {
  constructor(private db: IDrizzleConnection) {}

  async findById(id: number): Promise<Genre | undefined> {
    const entry = await this.db.query.genres.findFirst({
      where: (genres, { eq }) => eq(genres.id, id),
      with: {
        parents: { columns: { parentId: true } },
        influencedBy: { columns: { influencerId: true } },
        akas: {
          columns: { name: true, relevance: true },
          orderBy: (genreAkas, { asc, desc }) => [desc(genreAkas.relevance), asc(genreAkas.order)],
        },
      },
    })
    if (!entry) return

    const parents = new Set(entry.parents.map((p) => p.parentId))
    const influences = new Set(entry.influencedBy.map((i) => i.influencerId))

    const akas: { primary: string[]; secondary: string[]; tertiary: string[] } = {
      primary: [],
      secondary: [],
      tertiary: [],
    }
    for (const aka of entry.akas) {
      if (aka.relevance === 3) {
        akas.primary.push(aka.name)
      } else if (aka.relevance === 2) {
        akas.secondary.push(aka.name)
      } else {
        akas.tertiary.push(aka.name)
      }
    }

    const genre = new Genre({
      id: entry.id,
      name: entry.name,
      subtitle: entry.subtitle ?? undefined,
      type: entry.type,
      nsfw: entry.nsfw,
      shortDescription: entry.shortDescription ?? undefined,
      longDescription: entry.longDescription ?? undefined,
      notes: entry.notes ?? undefined,
      parents,
      influences,
      akas,
      relevance: entry.relevance,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    })

    return genre
  }

  async getGenreTree(): Promise<GenreTree> {
    const nodes = await this.db.query.genres.findMany({
      columns: {
        id: true,
        name: true,
      },
      with: {
        parents: { columns: { parentId: true } },
      },
    })

    const tree = new GenreTree(
      nodes.map((node) => ({
        id: node.id,
        name: node.name,
        parents: new Set(node.parents.map((p) => p.parentId)),
      })),
    )

    return tree
  }

  async update(id: number, genre: Genre): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .update(genres)
        .set({
          name: genre.name,
          subtitle: genre.subtitle,
          type: genre.type,
          nsfw: genre.nsfw,
          shortDescription: genre.shortDescription,
          longDescription: genre.longDescription,
          notes: genre.notes,
          relevance: genre.relevance,
          updatedAt: genre.updatedAt,
        })
        .where(eq(genres.id, id))

      await tx.delete(genreAkas).where(eq(genreAkas.genreId, id))
      const akas = [
        ...genre.akas.primary.map((name, order) => ({ genreId: id, name, relevance: 3, order })),
        ...genre.akas.secondary.map((name, order) => ({ genreId: id, name, relevance: 2, order })),
        ...genre.akas.tertiary.map((name, order) => ({ genreId: id, name, relevance: 1, order })),
      ]
      if (akas.length > 0) {
        await tx.insert(genreAkas).values(akas)
      }

      await tx.delete(genreParents).where(eq(genreParents.childId, id))
      if (genre.parents.size > 0) {
        await tx.insert(genreParents).values(
          [...genre.parents].map((parentId) => ({
            parentId,
            childId: id,
          })),
        )
      }

      await tx.delete(genreInfluences).where(eq(genreInfluences.influencedId, id))
      if (genre.influences.size > 0) {
        await tx.insert(genreInfluences).values(
          [...genre.influences].map((influencerId) => ({
            influencerId,
            influencedId: id,
          })),
        )
      }
    })
  }
}
