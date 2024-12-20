import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'

import type {
  GetAllGenresQueryIncludeFields,
  GetAllGenresQueryInput,
  GetAllGenresQueryResult,
} from '../../queries/application/get-all-genres'
import type { GenreQueriesRouter } from '../../queries/web/router'
import { CustomError } from '../../shared/domain/base'
import type { GetGenreResult } from '../application/get-genre'
import type { GetGenreHistoryResult } from '../application/get-genre-history'
import type { GetGenreTreeResult } from '../application/get-genre-tree'
import type { GetLatestGenreUpdatesResult } from '../application/get-latest-genre-updates'

export type IGenreQueriesClient = {
  getAllGenres<I extends GetAllGenresQueryIncludeFields = never>(
    query: GetAllGenresQueryInput<I>,
  ): Promise<GetAllGenresQueryResult<I> | GenreQueriesClientError>

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
    | GenreQueriesClientError
  >

  getGenreHistory(genreId: number): Promise<
    | {
        history: GetGenreHistoryResult
        success: true
      }
    | GenreQueriesClientError
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
    | GenreQueriesClientError
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
    | GenreQueriesClientError
  >

  getGenreTree(): Promise<
    | {
        tree: GetGenreTreeResult
        success: true
      }
    | GenreQueriesClientError
  >

  getGenre(genreId: number): Promise<
    | {
        success: true
        genre: GetGenreResult
      }
    | GenreQueriesClientError
  >

  getLatestGenreUpdates(): Promise<
    | {
        readonly success: true
        readonly latestUpdates: GetLatestGenreUpdatesResult
      }
    | GenreQueriesClientError
  >

  getRandomGenreId(): Promise<
    | {
        readonly success: true
        readonly genre: number | undefined
      }
    | GenreQueriesClientError
  >
}

export class GenreQueriesClient implements IGenreQueriesClient {
  private client: ReturnType<typeof hc<GenreQueriesRouter>>

  constructor(baseUrl: string) {
    this.client = hc<GenreQueriesRouter>(baseUrl)
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
      return new GenreQueriesClientError(responseBody.error)
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
      return new GenreQueriesClientError(
        (responseBody as unknown as GenreQueriesErrorResponse).error,
      )
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
      return new GenreQueriesClientError(
        (responseBody as unknown as GenreQueriesErrorResponse).error,
      )
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
      return new GenreQueriesClientError(
        (responseBody as unknown as GenreQueriesErrorResponse).error,
      )
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
      return new GenreQueriesClientError(
        (responseBody as unknown as GenreQueriesErrorResponse).error,
      )
    }
    return responseBody
  }

  async getGenreTree() {
    const response = await this.client['genre-tree'].$get()
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenreQueriesClientError(
        (responseBody as unknown as GenreQueriesErrorResponse).error,
      )
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
      return new GenreQueriesClientError(
        (responseBody as unknown as GenreQueriesErrorResponse).error,
      )
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
      return new GenreQueriesClientError(
        (responseBody as unknown as GenreQueriesErrorResponse).error,
      )
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
      return new GenreQueriesClientError(
        (responseBody as unknown as GenreQueriesErrorResponse).error,
      )
    }
    return responseBody
  }
}

export class GenreQueriesClientError extends CustomError {
  constructor(public readonly originalError: GenreQueriesError) {
    super(originalError.name, originalError.message)
  }
}

type GenreQueriesErrorResponse = {
  success: false
  error: GenreQueriesError
}

type GenreQueriesError = {
  name: string
  message: string
  statusCode: StatusCode
  details?: unknown
}
