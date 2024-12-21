import type { InferRequestType } from 'hono/client'
import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'

import type {
  GetAllGenresQueryIncludeFields,
  GetAllGenresQueryInput,
  GetAllGenresQueryResult,
} from '../application/commands/get-all-genres'
import type { GetGenreResult } from '../application/commands/get-genre'
import type { GetGenreHistoryResult } from '../application/commands/get-genre-history'
import type { GetGenreTreeResult } from '../application/commands/get-genre-tree'
import type { GetLatestGenreUpdatesResult } from '../application/commands/get-latest-genre-updates'
import { CustomError } from '../domain/errors/base'
import type { GenreSchema, GenresRouter } from './router'

export type IGenresClient = {
  createGenre(body: GenreSchema): Promise<
    | {
        readonly success: true
        readonly id: number
      }
    | GenresClientError
  >

  deleteGenre(id: number): Promise<
    | {
        readonly success: true
      }
    | GenresClientError
  >

  updateGenre(
    id: number,
    body: GenreSchema,
  ): Promise<
    | {
        readonly success: true
      }
    | GenresClientError
  >

  voteGenreRelevance(
    id: number,
    relevanceVote: number,
  ): Promise<
    | {
        readonly success: true
      }
    | GenresClientError
  >

  getAllGenres<I extends GetAllGenresQueryIncludeFields = never>(
    query: GetAllGenresQueryInput<I>,
  ): Promise<GetAllGenresQueryResult<I> | GenresClientError>

  getGenreHistoryByAccount(accountId: number): Promise<
    | {
        success: true
        history: {
          createdAt: Date
          id: number
          name: string
          type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
          subtitle: string | null
          operation: 'CREATE' | 'UPDATE' | 'DELETE'
          treeGenreId: number
          nsfw: boolean
        }[]
      }
    | GenresClientError
  >

  getGenreHistory(genreId: number): Promise<
    | {
        history: GetGenreHistoryResult
        success: true
      }
    | GenresClientError
  >

  getGenreRelevanceVoteByAccount(
    genreId: number,
    accountId: number,
  ): Promise<
    | {
        readonly success: true
        readonly vote:
          | {
              genreId: number
              accountId: number
              relevance: number
              createdAt: Date
              updatedAt: Date
            }
          | undefined
      }
    | GenresClientError
  >

  getGenreRelevanceVotesByGenre(genreId: number): Promise<
    | {
        success: boolean
        votes: {
          genreId: number
          accountId: number
          relevance: number
          createdAt: string
          updatedAt: string
        }[]
      }
    | GenresClientError
  >

  getGenreTree(): Promise<
    | {
        tree: GetGenreTreeResult
        success: true
      }
    | GenresClientError
  >

  getGenre(genreId: number): Promise<
    | {
        success: true
        genre: GetGenreResult
      }
    | GenresClientError
  >

  getLatestGenreUpdates(): Promise<
    | {
        readonly success: true
        readonly latestUpdates: GetLatestGenreUpdatesResult
      }
    | GenresClientError
  >

  getRandomGenreId(): Promise<
    | {
        readonly success: true
        readonly genre: number | undefined
      }
    | GenresClientError
  >
}

export class GenresClient implements IGenresClient {
  private client: ReturnType<typeof hc<GenresRouter>>
  private sessionToken: string | undefined

  constructor(baseUrl: string, sessionToken: string | undefined) {
    this.client = hc<GenresRouter>(baseUrl)
    this.sessionToken = sessionToken
  }

  async createGenre(body: InferRequestType<typeof this.client.genres.$post>['json']) {
    const response = await this.client.genres.$post(
      { json: body },
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError(responseBody.error)
    }
    return responseBody
  }

  async deleteGenre(id: number) {
    const response = await this.client.genres[':id'].$delete(
      { param: { id: id.toString() } },
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError(responseBody.error)
    }
    return responseBody
  }

  async updateGenre(
    id: number,
    body: InferRequestType<(typeof this.client.genres)[':id']['$put']>['json'],
  ) {
    const response = await this.client.genres[':id'].$put(
      { param: { id: id.toString() }, json: body },
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError(responseBody.error)
    }
    return responseBody
  }

  async voteGenreRelevance(id: number, relevanceVote: number) {
    const response = await this.client.genres[':id'].relevance.votes.$post(
      {
        param: { id: id.toString() },
        json: { relevanceVote },
      },
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError(responseBody.error)
    }
    return responseBody
  }

  async getAllGenres<I extends GetAllGenresQueryIncludeFields = never>(
    query: GetAllGenresQueryInput<I>,
  ) {
    const response = await this.client.genres.$get({
      query: {
        skip: query.skip?.toString(),
        limit: query.limit?.toString(),
        include: query.include,

        name: query.filter?.name,
        subtitle: query.filter?.subtitle,
        type: query.filter?.type,
        relevance: query.filter?.relevance,
        nsfw: query.filter?.nsfw,
        shortDescription: query.filter?.shortDescription,
        longDescription: query.filter?.longDescription,
        notes: query.filter?.notes,
        createdAt: query.filter?.createdAt,
        updatedAt: query.filter?.updatedAt,
        createdBy: query.filter?.createdBy?.toString(),
        parents: query.filter?.parents,
        ancestors: query.filter?.ancestors,

        sort: query.sort?.field,
        order: query.sort?.order,
      },
    })
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError(responseBody.error)
    }
    return {
      ...responseBody,
      data: responseBody.data.map((genre) => ({
        ...genre,
        createdAt: new Date(genre.createdAt),
        updatedAt: new Date(genre.updatedAt),
      })) as unknown as GetAllGenresQueryResult<I>['data'],
    }
  }

  async getGenreHistoryByAccount(accountId: number) {
    const response = await this.client.genres.history['by-account'][':accountId'].$get({
      param: { accountId: accountId.toString() },
    })
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError((responseBody as unknown as GenresErrorResponse).error)
    }
    return {
      ...responseBody,
      history: responseBody.history.map((history) => ({
        ...history,
        createdAt: new Date(history.createdAt),
      })),
    }
  }

  async getGenreHistory(genreId: number) {
    const response = await this.client.genres[':id'].history.$get({
      param: { id: genreId.toString() },
    })
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError((responseBody as unknown as GenresErrorResponse).error)
    }
    return {
      ...responseBody,
      history: responseBody.history.map((history) => ({
        ...history,
        createdAt: new Date(history.createdAt),
      })),
    }
  }

  async getGenreRelevanceVoteByAccount(genreId: number, accountId: number) {
    const response = await this.client.genres[':id'].relevance.votes[':accountId'].$get({
      param: { id: genreId.toString(), accountId: accountId.toString() },
    })
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError((responseBody as unknown as GenresErrorResponse).error)
    }
    return {
      ...responseBody,
      vote:
        responseBody.vote !== undefined
          ? {
              ...responseBody.vote,
              createdAt: new Date(responseBody.vote.createdAt),
              updatedAt: new Date(responseBody.vote.updatedAt),
            }
          : undefined,
    }
  }

  async getGenreRelevanceVotesByGenre(genreId: number) {
    const response = await this.client.genres[':id'].relevance.votes.$get({
      param: { id: genreId.toString() },
    })
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError((responseBody as unknown as GenresErrorResponse).error)
    }
    return responseBody
  }

  async getGenreTree() {
    const response = await this.client['genre-tree'].$get()
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError((responseBody as unknown as GenresErrorResponse).error)
    }
    return {
      ...responseBody,
      tree: responseBody.tree.map((genre) => ({
        ...genre,
        updatedAt: new Date(genre.updatedAt),
      })),
    }
  }

  async getGenre(genreId: number) {
    const response = await this.client.genres[':id'].$get({
      param: { id: genreId.toString() },
    })
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError((responseBody as unknown as GenresErrorResponse).error)
    }
    return {
      ...responseBody,
      genre: {
        ...responseBody.genre,
        createdAt: new Date(responseBody.genre.createdAt),
        updatedAt: new Date(responseBody.genre.updatedAt),
      },
    }
  }

  async getLatestGenreUpdates() {
    const response = await this.client['latest-genre-updates'].$get()
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError((responseBody as unknown as GenresErrorResponse).error)
    }
    return {
      ...responseBody,
      latestUpdates: responseBody.latestUpdates.map((update) => ({
        ...update,
        genre: { ...update.genre, createdAt: new Date(update.genre.createdAt) },
        previousHistory:
          update.previousHistory !== undefined
            ? { ...update.previousHistory, createdAt: new Date(update.previousHistory.createdAt) }
            : undefined,
      })),
    }
  }

  async getRandomGenreId() {
    const response = await this.client['random-genre'].$get()
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenresClientError((responseBody as unknown as GenresErrorResponse).error)
    }
    return responseBody
  }
}

type GenresErrorResponse = {
  success: false
  error: GenresError
}

type GenresError = {
  name: string
  message: string
  statusCode: StatusCode
  details?: unknown
}

export class GenresClientError extends CustomError {
  constructor(public readonly originalError: GenresError) {
    super(originalError.name, originalError.message)
  }
}
