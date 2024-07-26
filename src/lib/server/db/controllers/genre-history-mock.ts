import { vi } from 'vitest'

import type { IGenreHistoryDatabase } from './genre-history'

export class MockGenreHistoryDatabase implements IGenreHistoryDatabase {
  insert = vi.fn()
  findLatest = vi.fn()
  findLatestByGenreId = vi.fn()
  findPreviousByGenreId = vi.fn()
  findByGenreId = vi.fn()
  findByAccountId = vi.fn()
}
