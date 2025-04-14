import { CustomError } from '@romulus/custom-error'
import { hc, type InferRequestType, type InferResponseType } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'
import { err, ok, ResultAsync } from 'neverthrow'

import type { MediaCommandsRouter } from './router.js'

export type MediaCommandsClient = ReturnType<typeof createMediaCommandsClient>

export function createMediaCommandsClient(options: {
  baseUrl: string
  sessionToken: string | undefined
  fetch?: typeof fetch
}) {
  const client = hc<MediaCommandsRouter>(options.baseUrl, {
    fetch: options.fetch ?? fetch,
    headers: { authorization: `Bearer ${options.sessionToken}` },
  })

  type Client = typeof client

  return {
    createMediaType(body: InferRequestType<Client['media-types']['$post']>['json']) {
      return ResultAsync.fromPromise(
        client['media-types'].$post({ json: body }),
        (err) => new FetchError(toError(err)),
      )
        .map<InferResponseType<Client['media-types']['$post']>>((res) => res.json())
        .andThen((res) => (res.success ? ok(res) : err(res.error)))
    },

    createMediaArtifactType(
      body: InferRequestType<Client['media-artifact-types']['$post']>['json'],
    ) {
      return ResultAsync.fromPromise(
        client['media-artifact-types'].$post({ json: body }),
        (err) => new FetchError(toError(err)),
      )
        .map<InferResponseType<Client['media-artifact-types']['$post']>>((res) => res.json())
        .andThen((res) => (res.success ? ok(res) : err(res.error)))
    },

    updateMediaArtifactType(
      id: string,
      body: InferRequestType<Client['media-artifact-types'][':id']['$put']>['json'],
    ) {
      return ResultAsync.fromPromise(
        client['media-artifact-types'][':id'].$put({ json: body, param: { id } }),
        (err) => new FetchError(toError(err)),
      )
        .map<InferResponseType<Client['media-artifact-types'][':id']['$put']>>((res) => res.json())
        .andThen((res) => (res.success ? ok(res) : err(res.error)))
    },

    deleteMediaArtifactType(id: string) {
      return ResultAsync.fromPromise(
        client['media-artifact-types'][':id'].$delete({ param: { id } }),
        (err) => new FetchError(toError(err)),
      )
        .map<InferResponseType<Client['media-artifact-types'][':id']['$delete']>>((res) =>
          res.json(),
        )
        .andThen((res) => (res.success ? ok(res) : err(res.error)))
    },

    createMediaArtifactRelationshipType(
      body: InferRequestType<Client['media-artifact-relationship-types']['$post']>['json'],
    ) {
      return ResultAsync.fromPromise(
        client['media-artifact-relationship-types'].$post({ json: body }),
        (err) => new FetchError(toError(err)),
      )
        .map<InferResponseType<Client['media-artifact-relationship-types']['$post']>>((res) =>
          res.json(),
        )
        .andThen((res) => (res.success ? ok(res) : err(res.error)))
    },

    updateMediaArtifactRelationshipType(
      id: string,
      body: InferRequestType<Client['media-artifact-relationship-types'][':id']['$put']>['json'],
    ) {
      return ResultAsync.fromPromise(
        client['media-artifact-relationship-types'][':id'].$put({ param: { id }, json: body }),
        (err) => new FetchError(toError(err)),
      )
        .map<InferResponseType<Client['media-artifact-relationship-types'][':id']['$put']>>((res) =>
          res.json(),
        )
        .andThen((res) => (res.success ? ok(res) : err(res.error)))
    },
  }
}

type MediaError = {
  name: string
  message: string
  statusCode: StatusCode
  details?: unknown
}

export class MediaClientError extends CustomError {
  constructor(public readonly originalError: MediaError) {
    super(originalError.name, originalError.message)
  }
}

export class FetchError extends CustomError<'FetchError'> {
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
