import type { InferInsertModel } from 'drizzle-orm'

import type { genres } from '$lib/server/db/schema'

export type InsertTestGenre = Omit<InferInsertModel<typeof genres>, 'updatedAt'> & {
  parents?: string[]
}

export const singleGenreWithSubtitle: InsertTestGenre = {
  name: 'Genre',
  subtitle: 'Subtitle',
}

export const singleGenreWithoutSubtitle: InsertTestGenre = {
  name: 'Genre',
}

export const parentChildGenre: InsertTestGenre[] = [
  { name: 'Parent' },
  { name: 'Child', parents: ['Parent'] },
]

export const parentChildGrandchildGenre: InsertTestGenre[] = [
  { name: 'Parent' },
  { name: 'Child', parents: ['Parent'] },
  { name: 'Grandchild', parents: ['Child'] },
]
