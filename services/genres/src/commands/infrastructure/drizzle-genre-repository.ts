import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../../shared/infrastructure/drizzle-database'
import { genreAkas, genres } from '../../shared/infrastructure/drizzle-schema'
import { Genre } from '../domain/genre'
import type { GenreRepository } from '../domain/genre-repository'

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
      akas,
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
    })

    return { id }
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(genres).where(eq(genres.id, id))
  }
}
