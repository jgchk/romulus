import { omit } from 'ramda'
import { vi } from 'vitest'

import { DEFAULT_GENRE_TYPE, UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import type { Genre, GenreAka, GenreInfluence, GenreParent, GenreRelevanceVote } from './schema'
import type {
  IAccountsDatabase,
  IDatabase,
  IGenreHistoryDatabase,
  IGenreInfluencesDatabase,
  IGenreParentsDatabase,
  IGenreRelevanceVotesDatabase,
  IGenresDatabase,
  IPasswordResetTokensDatabase,
} from './wrapper'

export default class MockDatabase implements IDatabase {
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
