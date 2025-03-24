import { expect, it } from 'vitest'

import { createGenreStore } from '../infrastructure'
import { createGetGenreQuery } from './get-genre'

it('should return the data for a given genre', () => {
  const genres = [
    {
      id: 0,
      name: 'Zero',
      children: [1],
      derivations: [],
      nsfw: false,
      subtitle: null,
      type: 'STYLE' as const,
      relevance: 0,
      akas: [],
      updatedAt: new Date(),
    },
    {
      id: 1,
      name: 'One',
      children: [],
      derivations: [],
      nsfw: false,
      subtitle: null,
      type: 'STYLE' as const,
      relevance: 0,
      akas: [],
      updatedAt: new Date(),
    },
  ]

  const getGenre = createGetGenreQuery(createGenreStore(genres))

  expect(getGenre(1)).toEqual({
    id: 1,
    name: 'One',
    children: [],
    derivations: [],
    nsfw: false,
    subtitle: null,
    type: 'STYLE',
    relevance: 0,
    akas: [],
    updatedAt: expect.any(Date) as Date,
  })
})
