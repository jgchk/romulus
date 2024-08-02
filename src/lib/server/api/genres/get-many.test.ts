import { expect } from 'vitest'

import { GenresDatabase } from '$lib/server/db/controllers/genre'

import { test } from '../../../../vitest-setup'
import getManyGenres from './get-many'

test('should return an empty array of genres when there are no genres in the DB', async ({
  dbConnection,
}) => {
  const result = await getManyGenres({}, dbConnection)
  expect(result).toEqual({
    data: [],
    pagination: {
      skip: 0,
      limit: 10,
      total: 0,
    },
  })
})

test('should return an array of genres when there are genres in the DB', async ({
  dbConnection,
}) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [{ name: 'Test', akas: [], parents: [], influencedBy: [], updatedAt: new Date() }],
    dbConnection,
  )

  const result = await getManyGenres({}, dbConnection)

  expect(result).toEqual({
    data: [
      {
        id: 1,
        name: 'Test',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      },
    ],
    pagination: {
      skip: 0,
      limit: 10,
      total: 1,
    },
  })
})

test('should paginate the results', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      { name: 'Test 1', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
      { name: 'Test 2', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
      { name: 'Test 3', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
      { name: 'Test 4', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
      { name: 'Test 5', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
    ],
    dbConnection,
  )

  const result = await getManyGenres({ skip: 2, limit: 2 }, dbConnection)

  expect(result).toEqual({
    data: [
      {
        id: 3,
        name: 'Test 3',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      },
      {
        id: 4,
        name: 'Test 4',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      },
    ],
    pagination: {
      skip: 2,
      limit: 2,
      total: 5,
    },
  })
})

test('should handle a limit that is larger than the number of genres in the DB', async ({
  dbConnection,
}) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      { name: 'Test 1', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
      { name: 'Test 2', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
      { name: 'Test 3', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
    ],
    dbConnection,
  )

  const result = await getManyGenres({ skip: 0, limit: 10 }, dbConnection)

  expect(result).toEqual({
    data: [
      {
        id: 1,
        name: 'Test 1',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      },
      {
        id: 2,
        name: 'Test 2',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      },
      {
        id: 3,
        name: 'Test 3',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      },
    ],
    pagination: {
      skip: 0,
      limit: 10,
      total: 3,
    },
  })
})

test('should handle a skip that is larger than the number of genres in the DB', async ({
  dbConnection,
}) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      { name: 'Test 1', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
      { name: 'Test 2', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
      { name: 'Test 3', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
    ],
    dbConnection,
  )
  const result = await getManyGenres({ skip: 10, limit: 2 }, dbConnection)
  expect(result).toEqual({
    data: [],
    pagination: {
      skip: 10,
      limit: 2,
      total: 3,
    },
  })
})

test('should handle a limit of 0', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      { name: 'Test 1', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
      { name: 'Test 2', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
      { name: 'Test 3', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
    ],
    dbConnection,
  )
  const result = await getManyGenres({ skip: 0, limit: 0 }, dbConnection)
  expect(result).toEqual({
    data: [],
    pagination: {
      skip: 0,
      limit: 0,
      total: 3,
    },
  })
})

test('should include parent ids when requested', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      { name: 'Test 1', akas: [], parents: [2], influencedBy: [], updatedAt: new Date() },
      { name: 'Test 2', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
    ],
    dbConnection,
  )
  const result = await getManyGenres({ skip: 0, limit: 2, include: ['parents'] }, dbConnection)
  expect(result).toEqual({
    data: [
      {
        id: 1,
        name: 'Test 1',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
        parents: [2],
      },
      {
        id: 2,
        name: 'Test 2',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
        parents: [],
      },
    ],
    pagination: {
      skip: 0,
      limit: 2,
      total: 2,
    },
  })
})

test('should include influencedBy ids when requested', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      { name: 'Test 1', akas: [], parents: [], influencedBy: [2], updatedAt: new Date() },
      { name: 'Test 2', akas: [], parents: [], influencedBy: [], updatedAt: new Date() },
    ],
    dbConnection,
  )
  const result = await getManyGenres({ skip: 0, limit: 2, include: ['influencedBy'] }, dbConnection)
  expect(result).toEqual({
    data: [
      {
        id: 1,
        name: 'Test 1',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
        influencedBy: [2],
      },
      {
        id: 2,
        name: 'Test 2',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
        influencedBy: [],
      },
    ],
    pagination: {
      skip: 0,
      limit: 2,
      total: 2,
    },
  })
})

test('should include akas when requested', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      {
        name: 'Test 1',
        akas: [
          { relevance: 1, order: 1, name: 'tertiary-two' },
          { relevance: 1, order: 0, name: 'tertiary-one' },
          { relevance: 2, order: 1, name: 'secondary-two' },
          { relevance: 2, order: 0, name: 'secondary-one' },
          { relevance: 3, order: 0, name: 'primary-one' },
          { relevance: 3, order: 1, name: 'primary-two' },
        ],
        parents: [],
        influencedBy: [],
        updatedAt: new Date(),
      },
    ],
    dbConnection,
  )
  const result = await getManyGenres({ skip: 0, limit: 2, include: ['akas'] }, dbConnection)
  expect(result).toEqual({
    data: [
      {
        id: 1,
        name: 'Test 1',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
        akas: {
          primary: ['primary-one', 'primary-two'],
          secondary: ['secondary-one', 'secondary-two'],
          tertiary: ['tertiary-one', 'tertiary-two'],
        },
      },
    ],
    pagination: {
      skip: 0,
      limit: 2,
      total: 1,
    },
  })
})
