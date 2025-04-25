import { type GenreType } from '$lib/types/genres'

const GenreFormFields = {
  name: '',
  subtitle: '',
  type: 'STYLE' as GenreType,
  primaryAkas: '',
  secondaryAkas: '',
  tertiaryAkas: '',
  shortDescription: '',
  longDescription: '',
  notes: '',
  relevance: 0,
} as const

export type GenreFormField = keyof typeof GenreFormFields

export const isGenreFormField = (t: string): t is GenreFormField => t in GenreFormFields
