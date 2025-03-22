import { expect, it } from 'vitest'

import { createGetGenreQuery } from './get-genre'

it('should return the data for a given genre', () => {
  const genres = [
    {
      id: 0,
      name: 'Zero',
      parents: [],
      derivedFrom: [],
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
      parents: [0],
      derivedFrom: [],
      nsfw: false,
      subtitle: null,
      type: 'STYLE' as const,
      relevance: 0,
      akas: [],
      updatedAt: new Date(),
    },
  ]

  const getGenre = createGetGenreQuery(genres)

  expect(getGenre(1)).toEqual({
    id: 1,
    name: 'One',
    parents: [0],
    derivedFrom: [],
    nsfw: false,
    subtitle: null,
    type: 'STYLE',
    relevance: 0,
    akas: [],
    updatedAt: expect.any(Date) as Date,
  })
})
