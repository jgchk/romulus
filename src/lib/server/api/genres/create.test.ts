import { omit } from 'ramda'
import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_GENRE_TYPE, UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import type {
  Genre,
  GenreAka,
  GenreInfluence,
  GenreParent,
  GenreRelevanceVote,
} from '../../db/schema'
import type {
  IAccountsDatabase,
  IDatabase,
  IGenreHistoryDatabase,
  IGenreInfluencesDatabase,
  IGenreParentsDatabase,
  IGenreRelevanceVotesDatabase,
  IGenresDatabase,
  IPasswordResetTokensDatabase,
} from '../../db/wrapper'
import { createGenre } from './create'

class MockDatabase implements IDatabase {
  id: number
  db: {
    genres: Map<Genre['id'], Genre>
    genreAkas: Map<string, GenreAka>
    genreParents: Map<string, GenreParent>
    genreInfluences: Map<string, GenreInfluence>
    genreRelevanceVotes: Map<string, GenreRelevanceVote>
  }

  constructor() {
    this.id = 0
    this.db = {
      genres: new Map(),
      genreAkas: new Map(),
      genreParents: new Map(),
      genreInfluences: new Map(),
      genreRelevanceVotes: new Map(),
    }
  }

  async transaction<T>(fn: (tx: IDatabase) => Promise<T>): Promise<T> {
    return fn(this)
  }

  accounts: IAccountsDatabase = {
    insert: vi.fn(),
    findById: vi.fn(),
    findByUsername: vi.fn(),
    update: vi.fn(),
    deleteByUsername: vi.fn(),
    deleteAll: vi.fn(),
  }

  passwordResetTokens: IPasswordResetTokensDatabase = {
    insert: vi.fn(),
    findByTokenHash: vi.fn(),
    deleteByAccountId: vi.fn(),
    deleteByTokenHash: vi.fn(),
  }

  genres: IGenresDatabase = {
    insert: vi.fn((...data) => {
      const results = []

      for (const insertGenre of data) {
        const genre = {
          id: this.id++,
          name: insertGenre.name,
          subtitle: insertGenre.subtitle ?? null,
          type: insertGenre.type ?? DEFAULT_GENRE_TYPE,
          relevance: insertGenre.relevance ?? UNSET_GENRE_RELEVANCE,
          nsfw: insertGenre.nsfw ?? false,
          shortDescription: insertGenre.shortDescription ?? null,
          longDescription: insertGenre.longDescription ?? null,
          notes: insertGenre.notes ?? null,
          createdAt: insertGenre.createdAt ?? new Date(),
          updatedAt: insertGenre.updatedAt,
        }
        this.db.genres.set(genre.id, genre)

        const akas = []
        for (const insertAka of insertGenre.akas) {
          const aka = { ...insertAka, genreId: genre.id }
          this.db.genreAkas.set(`${genre.id}-${insertAka.name}`, aka)
          akas.push(omit(['genreId'], aka))
        }

        const parents = []
        for (const parentId of insertGenre.parents) {
          const parent = { parentId: parentId, childId: genre.id }
          this.db.genreParents.set(`${parentId}-${genre.id}`, parent)
          parents.push(parent)
        }

        const influencedBy = []
        for (const influencerId of insertGenre.influencedBy) {
          const influence = { influencerId, influencedId: genre.id }
          this.db.genreInfluences.set(`${influencerId}-${genre.id}`, influence)
          influencedBy.push(influence)
        }

        results.push({ ...genre, akas, parents, influencedBy })
      }

      return Promise.resolve(results)
    }),
    update: vi.fn(),
    findAllIds: vi.fn(),
    findByIdSimple: vi.fn(),
    findByIdDetail: vi.fn(),
    findByIdHistory: vi.fn(),
    findByIdEdit: vi.fn(),
    findByIds: vi.fn(),
    findAllSimple: vi.fn(),
    findAllTree: vi.fn(),
    deleteById: vi.fn(),
    deleteAll: vi.fn(),
  }

  genreParents: IGenreParentsDatabase = {
    insert: vi.fn(),
    find: vi.fn(),
    update: vi.fn(),
  }

  genreInfluences: IGenreInfluencesDatabase = {
    insert: vi.fn(),
  }

  genreRelevanceVotes: IGenreRelevanceVotesDatabase = {
    upsert: vi.fn(),
    findByGenreId: vi.fn(),
    findByGenreIdAndAccountId: vi.fn(),
    deleteByGenreId: vi.fn(),
  }

  genreHistory: IGenreHistoryDatabase = {
    insert: vi.fn(),
    findLatest: vi.fn(),
    findLatestByGenreId: vi.fn(),
    findPreviousByGenreId: vi.fn(),
    findByGenreId: vi.fn(),
    findByAccountId: vi.fn(),
  }
}

describe('createGenre', () => {
  const genreData = {
    name: 'Test',
    subtitle: null,
    type: 'STYLE' as const,
    shortDescription: null,
    longDescription: null,
    notes: null,
    primaryAkas: null,
    secondaryAkas: null,
    tertiaryAkas: null,
    parents: [],
    influencedBy: [],
    relevance: undefined,
    nsfw: false,
  }

  const accountId = 10101

  it('should create a genre', async () => {
    const db = new MockDatabase()
    const createdGenre = await createGenre(genreData, accountId, db)

    expect(createdGenre).toEqual({
      id: expect.any(Number) as number,
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      akas: [],
      parents: [],
      influencedBy: [],
      relevance: 99,
      nsfw: false,
      createdAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
    })
  })

  it('should support setting a subtitle', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        subtitle: 'Subtitle',
      },
      accountId,
      new MockDatabase(),
    )
    expect(createdGenre.subtitle).toBe('Subtitle')
  })

  it('should support setting a short description', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        shortDescription: 'Short description',
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.shortDescription).toBe('Short description')
  })

  it('should support setting a long description', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        longDescription: 'Long description',
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.longDescription).toBe('Long description')
  })

  it('should support setting notes', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        notes: 'Notes',
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.notes).toBe('Notes')
  })

  it('should support setting AKAs', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        primaryAkas: 'primary one, primary two',
        secondaryAkas: 'secondary one, secondary two',
        tertiaryAkas: 'tertiary one, tertiary two',
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.akas).toEqual([
      { name: 'primary one', relevance: 3, order: 0 },
      { name: 'primary two', relevance: 3, order: 1 },
      { name: 'secondary one', relevance: 2, order: 0 },
      { name: 'secondary two', relevance: 2, order: 1 },
      { name: 'tertiary one', relevance: 1, order: 0 },
      { name: 'tertiary two', relevance: 1, order: 1 },
    ])
  })

  it('should support setting parents', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        parents: [1, 2, 3],
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.parents).toEqual([1, 2, 3])
  })

  it('should support setting influences', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        influencedBy: [1, 2, 3],
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.influencedBy).toEqual([1, 2, 3])
  })

  it('should support setting a relevance', async () => {
    const db = new MockDatabase()
    const createdGenre = await createGenre(
      {
        ...genreData,
        relevance: 1,
      },
      accountId,
      db,
    )

    expect(createdGenre.relevance).toBe(1)

    expect(db.genreRelevanceVotes.upsert).toHaveBeenCalledTimes(1)
    expect(db.genreRelevanceVotes.upsert).toHaveBeenCalledWith({
      genreId: createdGenre.id,
      accountId,
      relevance: 1,
      updatedAt: expect.any(Date) as Date,
    })
  })

  it('should not add a relevance vote when relevance is unset', async () => {
    const db = new MockDatabase()
    await createGenre({ ...genreData, relevance: UNSET_GENRE_RELEVANCE }, accountId, db)
    expect(db.genreRelevanceVotes.upsert).not.toHaveBeenCalled()
  })

  it('should support setting NSFW', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        nsfw: true,
      },
      accountId,
      new MockDatabase(),
    )
    expect(createdGenre.nsfw).toBe(true)
  })

  it('should add a history entry', async () => {
    const db = new MockDatabase()
    const createdGenre = await createGenre(genreData, accountId, db)

    expect(db.genreHistory.insert).toHaveBeenCalledTimes(1)
    expect(db.genreHistory.insert).toHaveBeenCalledWith({
      treeGenreId: createdGenre.id,
      name: 'Test',
      subtitle: null,
      type: 'STYLE' as const,
      shortDescription: null,
      longDescription: null,
      notes: null,
      akas: [],
      parentGenreIds: [],
      influencedByGenreIds: [],
      relevance: 99,
      nsfw: false,
      accountId,
      operation: 'CREATE',
    })
  })
})
