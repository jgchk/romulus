import type { InferRequestType } from 'hono/client'
import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'

import { CustomError } from '../../shared/domain/base'
import type { GenreCommandsRouter } from './router'

export class GenreCommandsClient {
  private client: ReturnType<typeof hc<GenreCommandsRouter>>
  private sessionToken: string | undefined

  constructor(baseUrl: string, sessionToken: string | undefined) {
    this.client = hc<GenreCommandsRouter>(baseUrl)
    this.sessionToken = sessionToken
  }

  async createGenre(body: InferRequestType<typeof this.client.genres.$post>['json']) {
    const response = await this.client.genres.$post(
      { json: body },
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new GenreCommandsClientError(responseBody.error)
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
      return new GenreCommandsClientError(responseBody.error)
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
      return new GenreCommandsClientError(responseBody.error)
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
      return new GenreCommandsClientError(responseBody.error)
    }
    return responseBody
  }
}

export class GenreCommandsClientError extends CustomError {
  constructor(
    public readonly originalError: {
      name: string
      message: string
      statusCode: StatusCode
      details?: unknown
    },
  ) {
    super(originalError.name, originalError.message)
  }
}
