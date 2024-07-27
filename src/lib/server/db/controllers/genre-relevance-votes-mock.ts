import { vi } from 'vitest'

import type { IGenreRelevanceVotesDatabase } from './genre-relevance-votes'

export function MockGenreRelevanceVotesDatabase<T>(): IGenreRelevanceVotesDatabase<T> {
  return {
    upsert: vi.fn(),
    findByGenreId: vi.fn(),
    findByGenreIdAndAccountId: vi.fn(),
    deleteByGenreId: vi.fn(),
  }
}
