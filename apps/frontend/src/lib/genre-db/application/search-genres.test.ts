import { expect, it } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createGetAllGenresQuery } from './get-all-genres'
import { createSearchGenresQuery } from './search-genres'
import { createSetGenreCommand } from './set-genre'

const cases = [
  {
    dataset: [
      createExampleGenre({ id: 0, name: 'pop' }),
      createExampleGenre({ id: 1, name: 'rock' }),
      createExampleGenre({ id: 2, name: 'rap' }),
    ],
    query: 'rock',
    result: 1,
  },
  {
    dataset: [
      createExampleGenre({ id: 0, name: 'Pop' }),
      createExampleGenre({ id: 1, name: 'Rock' }),
      createExampleGenre({ id: 2, name: 'Rap' }),
    ],
    query: 'rock',
    result: 1,
  },
]

it.each(cases)(
  'should find the closest match for the given query',
  async ({ dataset, query, result }) => {
    const db = await createGenreDatabase(new IDBFactory())

    const setGenre = createSetGenreCommand(db)
    await Promise.all(dataset.map(setGenre))

    const searchGenres = createSearchGenresQuery(createGetAllGenresQuery(db))
    const results = await searchGenres(query)

    expect(results[0].id).toBe(result)
  },
)
