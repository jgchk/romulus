import { vi } from 'vitest'

import type {
  IDatabase,
  IGenreHistoryDatabase,
  IGenreInfluencesDatabase,
  IGenreParentsDatabase,
  IGenreRelevanceVotesDatabase,
  IPasswordResetTokensDatabase,
} from './wrapper'

export default class MockDatabase implements IDatabase {
  async transaction<T>(fn: (tx: IDatabase) => Promise<T>): Promise<T> {
    return fn(this)
  }

  passwordResetTokens: IPasswordResetTokensDatabase = {
    insert: vi.fn(),
    findByTokenHash: vi.fn(),
    deleteByAccountId: vi.fn(),
    deleteByTokenHash: vi.fn(),
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
