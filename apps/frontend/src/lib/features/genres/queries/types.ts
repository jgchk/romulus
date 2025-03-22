import type { GenreType } from '$lib/types/genres'

export type TreeGenre = {
  id: number
  name: string
  children: number[]
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
    children: [],
    derivedFrom: [],
    relevance: 1,
    updatedAt: new Date(),

    ...data,
  }
}

export type TreePath = (number | 'derived')[]
