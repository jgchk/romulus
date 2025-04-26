import { CustomError } from '@romulus/custom-error'
import type { InferResponseType } from 'hono/client'
import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'
import { err, ok, ResultAsync } from 'neverthrow'

import type { MediaQueriesRouter } from './router.js'

export type MediaQueriesClient = ReturnType<typeof createMediaQueriesClient>

export function createMediaQueriesClient(options: {
  baseUrl: string
  sessionToken: string | undefined
  fetch?: typeof fetch
}) {
  const client = hc<MediaQueriesRouter>(options.baseUrl, {
    fetch: options.fetch ?? fetch,
    headers: { authorization: `Bearer ${options.sessionToken}` },
  })

  type Client = typeof client

  return {
    getAllMediaTypes() {
      return ResultAsync.fromPromise(
        client['media-types'].$get(),
        (err) => new FetchError(toError(err)),
      ).map<InferResponseType<Client['media-types']['$get']>>((res) => res.json())
    },

    getMediaType(id: string) {
      return ResultAsync.fromPromise(
        client['media-types'][':id'].$get({ param: { id } }),
        (err) => new FetchError(toError(err)),
      )
        .map<InferResponseType<Client['media-types'][':id']['$get']>>((res) => res.json())
        .andThen((res) => (res.success ? ok(res) : err(res.error)))
    },

    getAllMediaArtifactTypes() {
      return ResultAsync.fromPromise(
        client['media-artifact-types'].$get(),
        (err) => new FetchError(toError(err)),
      ).map<InferResponseType<Client['media-artifact-types']['$get']>>((res) => res.json())
    },

    getMediaArtifactTypesByMediaType(mediaTypeId: string) {
      return ResultAsync.fromPromise(
        client['media-types'][':id']['media-artifact-types'].$get({ param: { id: mediaTypeId } }),
        (err) => new FetchError(toError(err)),
      ).map<InferResponseType<Client['media-types'][':id']['media-artifact-types']['$get']>>(
        (res) => res.json(),
      )
    },

    getMediaArtifactType(id: string) {
      return ResultAsync.fromPromise(
        client['media-artifact-types'][':id'].$get({ param: { id } }),
        (err) => new FetchError(toError(err)),
      )
        .map<InferResponseType<Client['media-artifact-types'][':id']['$get']>>((res) => res.json())
        .andThen((res) => (res.success ? ok(res) : err(res.error)))
    },

    getMediaArtifactRelationshipType(id: string) {
      return ResultAsync.fromPromise(
        client['media-artifact-relationship-types'][':id'].$get({ param: { id } }),
        (err) => new FetchError(toError(err)),
      )
        .map<InferResponseType<Client['media-artifact-relationship-types'][':id']['$get']>>((res) =>
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
