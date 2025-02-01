import { CustomError } from '@romulus/custom-error'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'
import { err, ok, ResultAsync } from 'neverthrow'

import type {
  GetAllGenresQueryIncludeFields,
  GetAllGenresQueryInput,
  GetAllGenresQueryResult,
} from '../application/commands/get-all-genres.js'
import type { GenresRouter } from './router.js'

export class GenresClient {
  private client: ReturnType<typeof hc<GenresRouter>>
  private sessionToken: string | undefined

  constructor(baseUrl: string, sessionToken: string | undefined) {
    this.client = hc<GenresRouter>(baseUrl)
    this.sessionToken = sessionToken
  }

  async createGenre(body: InferRequestType<typeof this.client.genres.$post>['json']) {
    return ResultAsync.fromPromise(
      this.client.genres.$post(
        { json: body },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.genres.$post>>((res) => res.json())
      .andThen((res) => (res.success ? ok(res) : err(res.error)))
  }

  async deleteGenre(id: number) {
    return ResultAsync.fromPromise(
      this.client.genres[':id'].$delete(
        { param: { id } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.genres)[':id']['$delete']>>((res) => res.json())
      .andThen((res) => (res.success ? ok(res) : err(res.error)))
  }

  async updateGenre(
    id: number,
    body: InferRequestType<(typeof this.client.genres)[':id']['$put']>['json'],
  ) {
    return ResultAsync.fromPromise(
      this.client.genres[':id'].$put(
        { param: { id }, json: body },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.genres)[':id']['$put']>>((res) => res.json())
      .andThen((res) => (res.success ? ok(res) : err(res.error)))
  }

  async voteGenreRelevance(id: number, relevanceVote: number) {
    return ResultAsync.fromPromise(
      this.client.genres[':id'].relevance.votes.$post(
        {
          param: { id },
          json: { relevanceVote },
        },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.genres)[':id']['relevance']['votes']['$post']>>(
        (res) => res.json(),
      )
      .andThen((res) => (res.success ? ok(res) : err(res.error)))
  }

  async getAllGenres<I extends GetAllGenresQueryIncludeFields = never>(
    query: GetAllGenresQueryInput<I>,
  ) {
    return ResultAsync.fromPromise(
      this.client.genres.$get({
        query: {
          skip: query.skip,
          limit: query.limit,
          include: query.include,

          name: query.filter?.name,
          subtitle: query.filter?.subtitle ?? undefined,
          type: query.filter?.type,
          relevance: query.filter?.relevance ?? undefined,
          nsfw: query.filter?.nsfw != null ? (query.filter.nsfw ? 'true' : 'false') : undefined,
          shortDescription: query.filter?.shortDescription ?? undefined,
          longDescription: query.filter?.longDescription ?? undefined,
          notes: query.filter?.notes ?? undefined,
          createdAt: query.filter?.createdAt,
          updatedAt: query.filter?.updatedAt,
          createdBy: query.filter?.createdBy,
          parent: query.filter?.parents,
          ancestor: query.filter?.ancestors,

          sort: query.sort?.field,
          order: query.sort?.order,
        },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.genres.$get>>((res) => res.json())
      .andThen((res) =>
        res.success
          ? ok({
              ...res,
              data: res.data.map((genre) => ({
                ...genre,
                createdAt: new Date(genre.createdAt),
                updatedAt: new Date(genre.updatedAt),
              })) as unknown as GetAllGenresQueryResult<I>['data'],
            })
          : err(res.error),
      )
  }

  async getGenreHistoryByAccount(accountId: number) {
    return ResultAsync.fromPromise(
      this.client.genres.history['by-account'][':accountId'].$get({
        param: { accountId },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<
        InferResponseType<(typeof this.client.genres.history)['by-account'][':accountId']['$get']>
      >((res) => res.json())
      .andThen((res) =>
        res.success
          ? ok({
              ...res,
              history: res.history.map((history) => ({
                ...history,
                createdAt: new Date(history.createdAt),
              })),
            })
          : err(res.error),
      )
  }

  async getGenreHistory(genreId: number) {
    return ResultAsync.fromPromise(
      this.client.genres[':id'].history.$get({
        param: { id: genreId },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.genres)[':id']['history']['$get']>>((res) =>
        res.json(),
      )
      .andThen((res) =>
        res.success
          ? ok({
              ...res,
              history: res.history.map((history) => ({
                ...history,
                createdAt: new Date(history.createdAt),
              })),
            })
          : err(res.error),
      )
  }

  async getGenreRelevanceVoteByAccount(genreId: number, accountId: number) {
    return ResultAsync.fromPromise(
      this.client.genres[':id'].relevance.votes[':accountId'].$get({
        param: { id: genreId, accountId },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<
        InferResponseType<
          (typeof this.client.genres)[':id']['relevance']['votes'][':accountId']['$get']
        >
      >((res) => res.json())
      .andThen((res) =>
        res.success
          ? ok({
              ...res,
              vote:
                res.vote !== undefined
                  ? {
                      ...res.vote,
                      createdAt: new Date(res.vote.createdAt),
                      updatedAt: new Date(res.vote.updatedAt),
                    }
                  : undefined,
            })
          : err(res.error),
      )
  }

  async getGenreRelevanceVotesByGenre(genreId: number) {
    return ResultAsync.fromPromise(
      this.client.genres[':id'].relevance.votes.$get({
        param: { id: genreId },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.genres)[':id']['relevance']['votes']['$get']>>(
        (res) => res.json(),
      )
      .andThen((res) => (res.success ? ok(res) : err(res.error)))
  }

  async getGenreTree() {
    return ResultAsync.fromPromise(
      this.client['genre-tree'].$get(),
      (err) => new FetchError(toError(err)),
    ).map<InferResponseType<(typeof this.client)['genre-tree']['$get']>>((res) => res.json())
  }

  async getGenre(genreId: number) {
    return ResultAsync.fromPromise(
      this.client.genres[':id'].$get({
        param: { id: genreId },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.genres)[':id']['$get']>>((res) => res.json())
      .andThen((res) =>
        res.success
          ? ok({
              ...res,
              genre: {
                ...res.genre,
                createdAt: new Date(res.genre.createdAt),
                updatedAt: new Date(res.genre.updatedAt),
              },
            })
          : err(res.error),
      )
  }

  async getLatestGenreUpdates() {
    return ResultAsync.fromPromise(
      this.client['latest-genre-updates'].$get(),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client)['latest-genre-updates']['$get']>>((res) =>
        res.json(),
      )
      .map((res) => ({
        ...res,
        latestUpdates: res.latestUpdates.map((update) => ({
          ...update,
          genre: { ...update.genre, createdAt: new Date(update.genre.createdAt) },
          previousHistory:
            update.previousHistory !== undefined
              ? {
                  ...update.previousHistory,
                  createdAt: new Date(update.previousHistory.createdAt),
                }
              : undefined,
        })),
      }))
  }

  async getRandomGenreId() {
    return ResultAsync.fromPromise(
      this.client['random-genre'].$get(),
      (err) => new FetchError(toError(err)),
    ).map<InferResponseType<(typeof this.client)['random-genre']['$get']>>((res) => res.json())
  }
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

export class FetchError extends CustomError {
  constructor(public readonly originalError: Error) {
    super('FetchError', `An error occurred while fetching: ${originalError.message}`)
  }
}

function toError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return new Error(error.message)
  }
  return new Error(String(error))
}
