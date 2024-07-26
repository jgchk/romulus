import { vi } from 'vitest'

import type { IGenreRelevanceVotesDatabase } from './genre-relevance-votes'

export class MockGenreRelevanceVotesDatabase implements IGenreRelevanceVotesDatabase {
  upsert = vi.fn()
  findByGenreId = vi.fn()
  findByGenreIdAndAccountId = vi.fn()
  deleteByGenreId = vi.fn()
}
