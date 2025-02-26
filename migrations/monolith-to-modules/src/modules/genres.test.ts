import { pglite } from '@romulus/genres/infrastructure'
import { expect } from 'vitest'

import { test } from '../vitest-setup.js'
import { migrateGenres } from './genres.js'

test('should migrate all genres', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migrateGenres(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const genres = await drizzle.query.genres.findMany()
  expect(genres).toHaveLength(14530)
  expect(genres.find((genre) => genre.id === 12360)).toEqual({
    id: 12360,
    name: '007',
    shortDescription: null,
    longDescription: null,
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
    notes: null,
    type: 'STYLE',
    relevance: 99,
    subtitle: 'Ballroom Role',
    nsfw: false,
  })
  expect(genres.find((genre) => genre.id === 15093)).toEqual({
    id: 15093,
    name: 'Zouk Bass',
    shortDescription: null,
    longDescription: null,
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
    notes: `https://boingboing.net/2013/08/23/zouk-bass-a-musical-primer-wi.html

short-lived trend started by buraka som sistema which merged tarraxo with moombahton.
https://soundcloud.com/burakasomsistemaofficial/buraka-som-sistema-sente
https://soundcloud.com/elcucorecordings/riot-earp-dj-melo-sin-padre`,
    type: 'TREND',
    relevance: 2,
    subtitle: null,
    nsfw: false,
  })
})

test('should migrate all genre akas', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migrateGenres(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const akas = await drizzle.query.genreAkas.findMany()
  expect(akas).toHaveLength(10154)
  expect(akas.find((aka) => aka.genreId === 14058)).toEqual({
    genreId: 14058,
    name: '소',
    relevance: 3,
    order: 0,
  })
  expect(akas.find((aka) => aka.genreId === 2706)).toEqual({
    genreId: 2706,
    name: 'World Theme',
    relevance: 3,
    order: 0,
  })
})

test('should migrate all derived relationships', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migrateGenres(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const derived = await drizzle.query.genreDerivedFrom.findMany()
  expect(derived).toHaveLength(732)
  expect(
    derived.find((derived) => derived.derivedFromId === 8 && derived.derivationId === 2534),
  ).toEqual({
    derivedFromId: 8,
    derivationId: 2534,
  })
  expect(
    derived.find((derived) => derived.derivedFromId === 98 && derived.derivationId === 2091),
  ).toEqual({
    derivedFromId: 98,
    derivationId: 2091,
  })
})

test('should migrate all genre history', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migrateGenres(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const history = await drizzle.query.genreHistory.findMany()
  expect(history).toHaveLength(38699)
  expect(history.find((entry) => entry.id === 2)).toEqual({
    id: 2,
    name: 'Christianity',
    type: 'META',
    shortDescription: null,
    longDescription: null,
    notes: null,
    parentGenreIds: [1922],
    influencedByGenreIds: [],
    treeGenreId: 1329,
    createdAt: expect.any(Date) as Date,
    operation: 'UPDATE',
    accountId: 6,
    subtitle: null,
    nsfw: false,
    derivedFromGenreIds: null,
  })
})

test('should migrate all genre history akas', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migrateGenres(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const akas = await drizzle.query.genreHistoryAkas.findMany()
  expect(akas).toHaveLength(29066)
  expect(akas.find((aka) => aka.genreId === 4 && aka.name === '')).toEqual({
    genreId: 4,
    name: '',
    relevance: 3,
    order: 0,
  })
  expect(akas.find((aka) => aka.genreId === 41895 && aka.name === 'Glitchtronica')).toEqual({
    genreId: 41895,
    name: 'Glitchtronica',
    relevance: 3,
    order: 1,
  })
})

test('should migrate all influence relationships', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migrateGenres(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const influences = await drizzle.query.genreInfluences.findMany()
  expect(influences).toHaveLength(10428)
  expect(
    influences.find(
      (influence) => influence.influencedId === 380 && influence.influencerId === 2201,
    ),
  ).toEqual({
    influencedId: 380,
    influencerId: 2201,
  })
  expect(
    influences.find(
      (influence) => influence.influencedId === 427 && influence.influencerId === 139,
    ),
  ).toEqual({
    influencedId: 427,
    influencerId: 139,
  })
})

test('should migrate all parent relationships', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migrateGenres(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const parents = await drizzle.query.genreParents.findMany()
  expect(parents).toHaveLength(20149)
  expect(parents.find((parent) => parent.parentId === 379 && parent.childId === 380)).toEqual({
    parentId: 379,
    childId: 380,
  })
  expect(parents.find((parent) => parent.parentId === 7726 && parent.childId === 7385)).toEqual({
    parentId: 7726,
    childId: 7385,
  })
})

test('should migrate all genre relevance votes', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migrateGenres(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const votes = await drizzle.query.genreRelevanceVotes.findMany()
  expect(votes).toHaveLength(10785)
  expect(votes.find((vote) => vote.genreId === 6123 && vote.accountId === 19)).toEqual({
    genreId: 6123,
    accountId: 19,
    relevance: 1,
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
  })
  expect(votes.find((vote) => vote.genreId === 15513 && vote.accountId === 142)).toEqual({
    genreId: 15513,
    accountId: 142,
    relevance: 3,
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
  })
})
