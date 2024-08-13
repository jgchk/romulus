import { vi } from 'vitest'

import type { IGenreParentsDatabase } from './genre-parents'

export function MockGenreParentsDatabase<T>(): IGenreParentsDatabase<T> {
  return {
    insert: vi.fn(),
    find: vi.fn(),
    findByParentId: vi.fn(),
    update: vi.fn(),
  }
}
