import { expect, it } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre, type TreeGenre } from '../types'
import { createGetChildrenQuery } from './get-children'
import { createGetGenreQuery } from './get-genre'
import { createGetPathToGenreQuery } from './get-path-to-genre'
import { createGetRootGenresQuery } from './get-root-genres'
import { createSetGenreCommand } from './set-genre'

it('should return the shortest path to a genre', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const genres = [
    createExampleGenre({ id: 0, parents: [] }),
    createExampleGenre({ id: 1, parents: [0] }),
    createExampleGenre({ id: 2, parents: [1] }),
    createExampleGenre({ id: 3, parents: [2] }),
  ]

  const setGenre = createSetGenreCommand(db)
  await Promise.all(genres.map(setGenre))

  const getPathToGenre = createGetPathToGenreQuery({
    getGenre: createGetGenreQuery(db),
    getRootGenres: createGetRootGenresQuery(db),
    getChildren: createGetChildrenQuery(db),
  })

  expect(await getPathToGenre(0)).toEqual([0])
  expect(await getPathToGenre(1)).toEqual([0, 1])
  expect(await getPathToGenre(2)).toEqual([0, 1, 2])
  expect(await getPathToGenre(3)).toEqual([0, 1, 2, 3])
})

it('should return the shortest path to a genre (2)', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const genres: TreeGenre[] = [
    {
      id: 1,
      name: 'gooby',
      subtitle: null,
      type: 'STYLE',
      relevance: 99,
      nsfw: false,
      updatedAt: new Date(),
      derivedFrom: [],
      akas: [],
      parents: [],
    },
    {
      id: 2,
      name: 'gooby2',
      subtitle: null,
      type: 'STYLE',
      relevance: 99,
      nsfw: false,
      updatedAt: new Date(),
      derivedFrom: [],
      akas: [],
      parents: [1],
    },
    {
      id: 3,
      name: 'yo',
      subtitle: null,
      type: 'STYLE',
      relevance: 99,
      nsfw: false,
      updatedAt: new Date(),
      derivedFrom: [],
      akas: [],
      parents: [],
    },
  ]

  const setGenre = createSetGenreCommand(db)
  await Promise.all(genres.map(setGenre))

  const getPathToGenre = createGetPathToGenreQuery({
    getGenre: createGetGenreQuery(db),
    getRootGenres: createGetRootGenresQuery(db),
    getChildren: createGetChildrenQuery(db),
  })

  expect(await getPathToGenre(2)).toEqual([1, 2])
})
