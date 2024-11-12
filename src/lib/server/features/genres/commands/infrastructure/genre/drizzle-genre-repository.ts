import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import {
  genreAkas,
  genreDerivedFrom,
  genreInfluences,
  genreParents,
  genres,
} from '$lib/server/db/schema'

import { Genre } from '../../domain/genre'
import type { GenreRepository } from '../../domain/genre-repository'
import { GenreTree } from '../../domain/genre-tree'

export class DrizzleGenreRepository implements GenreRepository {
  constructor(private db: IDrizzleConnection) {}

  async findById(id: number): Promise<Genre | undefined> {
    const entry = await this.db.query.genres.findFirst({
      where: (genres, { eq }) => eq(genres.id, id),
      with: {
        influencedBy: { columns: { influencerId: true } },
        akas: {
          columns: { name: true, relevance: true },
          orderBy: (genreAkas, { asc, desc }) => [desc(genreAkas.relevance), asc(genreAkas.order)],
        },
      },
    })
    if (!entry) return

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

    const genre = Genre.create({
      id: entry.id,
      name: entry.name,
      subtitle: entry.subtitle ?? undefined,
      type: entry.type,
      nsfw: entry.nsfw,
      shortDescription: entry.shortDescription ?? undefined,
      longDescription: entry.longDescription ?? undefined,
      notes: entry.notes ?? undefined,
      influences,
      akas,
      relevance: entry.relevance,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    })
    if (genre instanceof Error) {
      throw genre
    }

    return genre
  }

  async save(genre: Genre): Promise<{ id: number }> {
    if (genre.id === undefined) {
      return this.create(genre)
    } else {
      return this.update(genre.id, genre)
    }
  }

  private async create(genre: Genre): Promise<{ id: number }> {
    return this.db.transaction(async (tx) => {
      const [{ id }] = await tx
        .insert(genres)
        .values({
          name: genre.name,
          subtitle: genre.subtitle,
          type: genre.type,
          nsfw: genre.nsfw,
          shortDescription: genre.shortDescription,
          longDescription: genre.longDescription,
          notes: genre.notes,
          relevance: genre.relevance,
          createdAt: genre.createdAt,
          updatedAt: genre.updatedAt,
        })
        .returning({ id: genres.id })

      const akas = [
        ...genre.akas.primary.map((name, order) => ({ genreId: id, name, relevance: 3, order })),
        ...genre.akas.secondary.map((name, order) => ({ genreId: id, name, relevance: 2, order })),
        ...genre.akas.tertiary.map((name, order) => ({ genreId: id, name, relevance: 1, order })),
      ]
      if (akas.length > 0) {
        await tx.insert(genreAkas).values(akas)
      }

      if (genre.influences.size > 0) {
        await tx.insert(genreInfluences).values(
          [...genre.influences].map((influencerId) => ({
            influencerId,
            influencedId: id,
          })),
        )
      }

      return { id }
    })
  }

  private async update(id: number, genre: Genre): Promise<{ id: number }> {
    await this.db.transaction(async (tx) => {
      await tx
        .update(genres)
        .set({
          name: genre.name,
          subtitle: genre.subtitle ?? null,
          type: genre.type,
          nsfw: genre.nsfw,
          shortDescription: genre.shortDescription ?? null,
          longDescription: genre.longDescription ?? null,
          notes: genre.notes ?? null,
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

    return { id }
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(genres).where(eq(genres.id, id))
  }

  async getGenreTree(): Promise<GenreTree> {
    const nodes = await this.db.query.genres.findMany({
      columns: {
        id: true,
        name: true,
      },
      with: {
        parents: { columns: { parentId: true } },
        derivedFrom: { columns: { derivedFromId: true } },
      },
    })

    const tree = new GenreTree(
      nodes.map((node) => ({
        id: node.id,
        name: node.name,
        parents: new Set(node.parents.map((p) => p.parentId)),
        derivedFrom: new Set(node.derivedFrom.map((df) => df.derivedFromId)),
      })),
    )

    return tree
  }

  async saveGenreTree(genreTree: GenreTree): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(genreParents)
      await tx.delete(genreDerivedFrom)

      const parentChildNodes = [...genreTree.map.values()].flatMap((node) =>
        [...node.parents].map((parentId) => ({ parentId, childId: node.id })),
      )

      if (parentChildNodes.length > 0) {
        await tx.insert(genreParents).values(parentChildNodes)
      }

      const derivedFromNodes = [...genreTree.map.values()].flatMap((node) =>
        [...node.derivedFrom].map((derivedFromId) => ({ derivedFromId, derivationId: node.id })),
      )

      if (derivedFromNodes.length > 0) {
        await tx.insert(genreDerivedFrom).values(derivedFromNodes)
      }
    })
  }
}
