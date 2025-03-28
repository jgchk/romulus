import { CustomError } from '@romulus/custom-error'
import { hc, type InferResponseType } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'
import { ResultAsync } from 'neverthrow'

import type { MediaRouter } from './router.js'

export class MediaClient {
  private client: ReturnType<typeof hc<MediaRouter>>
  private sessionToken: string | undefined

  constructor(options: {
    baseUrl: string
    sessionToken: string | undefined
    fetch?: typeof fetch
  }) {
    this.client = hc<MediaRouter>(options.baseUrl, {
      fetch: options.fetch ?? fetch,
      headers: { authorization: `Bearer ${this.sessionToken}` },
    })
    this.sessionToken = options.sessionToken
  }

  async getAllMediaTypes() {
    return ResultAsync.fromPromise(
      this.client['media-types'].$get(),
      (err) => new FetchError(toError(err)),
    ).map<InferResponseType<(typeof this.client)['media-types']['$get']>>((res) => res.json())
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
