import type { GenreType } from '$lib/types/genres'

export type TreePath = (number | 'derived')[]

export type TreeGenre = {
  id: number
  name: string
  parents: number[]
  derivedFrom: number[]
  nsfw: boolean
  subtitle: string | null
  type: GenreType
  relevance: number
  akas: string[]
  updatedAt: Date
}

export function createExampleGenre(data?: Partial<TreeGenre>): TreeGenre {
  return {
    id: 0,
    name: 'Test Genre',
    subtitle: null,
    type: 'STYLE',
    akas: [],
    nsfw: false,
    parents: [],
    derivedFrom: [],
    relevance: 1,
    updatedAt: new Date(),

    ...data,
  }
}
