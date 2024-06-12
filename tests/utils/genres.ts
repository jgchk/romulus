import type { InferInsertModel } from 'drizzle-orm'

import type { genres } from '$lib/server/db/schema'

export type InsertTestGenre = Omit<InferInsertModel<typeof genres>, 'updatedAt'> & {
  parents?: string[]
}

export const singleGenre: InsertTestGenre = {
  name: 'Genre',
  subtitle: 'Subtitle',
}

export const parentChildGenre: InsertTestGenre[] = [
  { name: 'Parent', subtitle: 'Subtitle' },
  { name: 'Child', subtitle: 'Subtitle', parents: ['Parent'] },
]
