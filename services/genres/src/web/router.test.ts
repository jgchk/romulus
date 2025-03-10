import { testClient } from 'hono/testing'
import { describe, expect } from 'vitest'

import {
  CreateGenreCommand,
  DeleteGenreCommand,
  GetAllGenresQuery,
  GetGenreHistoryByAccountQuery,
  GetGenreHistoryQuery,
  GetGenreQuery,
  GetGenreRelevanceVoteByAccountQuery,
  GetGenreRelevanceVotesByGenreQuery,
  GetGenreTreeQuery,
  GetLatestGenreUpdatesQuery,
  GetRandomGenreIdQuery,
  UpdateGenreCommand,
  VoteGenreRelevanceCommand,
} from '../application/index.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import { DrizzleGenreHistoryRepository } from '../infrastructure/drizzle-genre-history-repository.js'
import { DrizzleGenreRelevanceVoteRepository } from '../infrastructure/drizzle-genre-relevance-vote-repository.js'
import { DrizzleGenreRepository } from '../infrastructure/drizzle-genre-repository.js'
import { DrizzleGenreTreeRepository } from '../infrastructure/drizzle-genre-tree-repository.js'
import { MockAuthenticationService } from '../test/mock-authentication-service.js'
import { MockAuthorizationService } from '../test/mock-authorization-service.js'
import { test } from '../vitest-setup.js'
import { createGenresRouter } from './router.js'

function setup(dbConnection: IDrizzleConnection) {
  const authentication = new MockAuthenticationService()
  const authorization = new MockAuthorizationService()

  const genreRepo = new DrizzleGenreRepository(dbConnection)
  const genreTreeRepo = new DrizzleGenreTreeRepository(dbConnection)
  const genreHistoryRepo = new DrizzleGenreHistoryRepository(dbConnection)
  const genreRelevanceVoteRepo = new DrizzleGenreRelevanceVoteRepository(dbConnection)

  const app = createGenresRouter({
    authentication: () => authentication,
    createGenreCommand: () =>
      new CreateGenreCommand(genreRepo, genreTreeRepo, genreHistoryRepo, authorization),
    deleteGenreCommand: () =>
      new DeleteGenreCommand(genreRepo, genreTreeRepo, genreHistoryRepo, authorization),
    updateGenreCommand: () =>
      new UpdateGenreCommand(genreRepo, genreTreeRepo, genreHistoryRepo, authorization),
    voteGenreRelevanceCommand: () =>
      new VoteGenreRelevanceCommand(genreRelevanceVoteRepo, authorization),
    getAllGenresQuery: () => new GetAllGenresQuery(dbConnection),
    getGenreHistoryByAccountQuery: () => new GetGenreHistoryByAccountQuery(dbConnection),
    getGenreHistoryQuery: () => new GetGenreHistoryQuery(dbConnection),
    getGenreRelevanceVoteByAccountQuery: () =>
      new GetGenreRelevanceVoteByAccountQuery(dbConnection),
    getGenreRelevanceVotesByGenreQuery: () => new GetGenreRelevanceVotesByGenreQuery(dbConnection),
    getGenreTreeQuery: () => new GetGenreTreeQuery(dbConnection),
    getGenreQuery: () => new GetGenreQuery(dbConnection),
    getLatestGenreUpdatesQuery: () => new GetLatestGenreUpdatesQuery(dbConnection),
    getRandomGenreIdQuery: () => new GetRandomGenreIdQuery(dbConnection),
  })
  const client = testClient(app)

  return { client }
}

describe('get-all-genres', () => {
  test('should accept no includes', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.genres.$get({
      query: { include: [] },
    })

    expect(res.status).toBe(200)
  })

  test('should accept a single include', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.genres.$get({
      query: { include: ['parents'] },
    })

    expect(res.status).toBe(200)
  })

  test('should accept multiple includes', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.genres.$get({
      query: { include: ['parents', 'influencedBy'] },
    })

    expect(res.status).toBe(200)
  })

  test('should accept no parent', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.genres.$get({
      query: { parent: [] },
    })

    expect(res.status).toBe(200)
  })

  test('should accept a single parent', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.genres.$get({
      query: { parent: [1] },
    })

    expect(res.status).toBe(200)
  })

  test('should accept multiple parents', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.genres.$get({
      query: { parent: [1, 2] },
    })

    expect(res.status).toBe(200)
  })

  test('should accept no ancestor', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.genres.$get({
      query: { ancestor: [] },
    })

    expect(res.status).toBe(200)
  })

  test('should accept a single ancestor', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.genres.$get({
      query: { ancestor: [1] },
    })

    expect(res.status).toBe(200)
  })

  test('should accept multiple ancestors', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.genres.$get({
      query: { ancestor: [1, 2] },
    })

    expect(res.status).toBe(200)
  })
})
