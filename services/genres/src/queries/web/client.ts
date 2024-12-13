import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'

import type {
  GetAllGenresQueryIncludeFields,
  GetAllGenresQueryInput,
} from '../../queries/application/get-all-genres'
import type { GenreQueriesRouter } from '../../queries/web/router'
import { CustomError } from '../../shared/domain/base'

export class GenreQueriesClient {
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
    return responseBody
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
    return responseBody
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
    return responseBody
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
    return responseBody
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
    return responseBody
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
    return responseBody
  }

  async getLatestGenreUpdates() {
    const response = await this.client['latest-genre-updates'].$get()
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenreQueriesClientError(
        (responseBody as unknown as GenreQueriesErrorResponse).error,
      )
    }
    return responseBody
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
