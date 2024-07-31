import { vi } from 'vitest'

import type { IGenreHistoryDatabase } from './genre-history'

export function MockGenreHistoryDatabase<T>(): IGenreHistoryDatabase<T> {
  return {
    insert: vi.fn(),
    findLatest: vi.fn(),
    findLatestByGenreId: vi.fn(),
    findPreviousByGenreId: vi.fn(),
    findByGenreId: vi.fn(),
    findByAccountId: vi.fn(),
    deleteAll: vi.fn(),
    deleteByGenreIds: vi.fn(),
  }
}
