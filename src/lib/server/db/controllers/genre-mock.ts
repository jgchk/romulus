import { vi } from 'vitest'

import type { IGenresDatabase } from './genre'

export function MockGenresDatabase<T>(): IGenresDatabase<T> {
  return {
    insert: vi.fn(),
    update: vi.fn(),
    findAllIds: vi.fn(),
    findByIdSimple: vi.fn(),
    findByIdDetail: vi.fn(),
    findByIdHistory: vi.fn(),
    findByIdEdit: vi.fn(),
    findByName: vi.fn(),
    findByIds: vi.fn(),
    findAllSimple: vi.fn(),
    findAllTree: vi.fn(),
    deleteById: vi.fn(),
    deleteByIds: vi.fn(),
    deleteAll: vi.fn(),
    findAll: vi.fn(),
  }
}
