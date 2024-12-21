import { GenreHistory } from '../domain/genre-history'
import type { GenreHistoryRepository } from '../domain/genre-history-repository'
import type { IDrizzleConnection } from './drizzle-database'
import { genreHistory, genreHistoryAkas } from './drizzle-schema'

export class DrizzleGenreHistoryRepository implements GenreHistoryRepository {
  constructor(private db: IDrizzleConnection) {}

  async findLatestByGenreId(genreId: number): Promise<GenreHistory | undefined> {
    const entry = await this.db.query.genreHistory.findFirst({
      where: (genreHistory, { eq }) => eq(genreHistory.treeGenreId, genreId),
      orderBy: (genreHistory, { desc }) => desc(genreHistory.createdAt),
      with: {
        akas: {
          columns: { name: true, relevance: true },
          orderBy: (genreHistoryAkas, { asc, desc }) => [
            desc(genreHistoryAkas.relevance),
            asc(genreHistoryAkas.order),
          ],
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

    const genreHistory = new GenreHistory(
      entry.name,
      entry.subtitle ?? undefined,
      entry.type,
      entry.nsfw,
      entry.shortDescription ?? undefined,
      entry.longDescription ?? undefined,
      entry.notes ?? undefined,

      new Set(entry.parentGenreIds),
      new Set(entry.derivedFromGenreIds),
      new Set(entry.influencedByGenreIds),
      akas,

      entry.treeGenreId,
      entry.createdAt,
      entry.operation,
      entry.accountId ?? undefined,
    )

    return genreHistory
  }

  async create(history: GenreHistory): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [{ genreHistoryId }] = await tx
        .insert(genreHistory)
        .values({
          name: history.name,
          subtitle: history.subtitle,
          type: history.type,
          nsfw: history.nsfw,
          shortDescription: history.shortDescription,
          longDescription: history.longDescription,
          notes: history.notes,
          parentGenreIds: [...history.parents],
          derivedFromGenreIds: [...history.derivedFrom],
          influencedByGenreIds: [...history.influences],
          treeGenreId: history.genreId,
          createdAt: history.createdAt,
          operation: history.operation,
          accountId: history.accountId,
        })
        .returning({ genreHistoryId: genreHistory.id })

      const akas = [
        ...history.akas.primary.map((name, order) => ({
          genreId: genreHistoryId,
          name,
          relevance: 3,
          order,
        })),
        ...history.akas.secondary.map((name, order) => ({
          genreId: genreHistoryId,
          name,
          relevance: 2,
          order,
        })),
        ...history.akas.tertiary.map((name, order) => ({
          genreId: genreHistoryId,
          name,
          relevance: 1,
          order,
        })),
      ]
      if (akas.length > 0) {
        await tx.insert(genreHistoryAkas).values(akas)
      }
    })
  }
}
