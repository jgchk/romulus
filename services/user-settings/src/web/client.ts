import { CustomError } from '@romulus/custom-error'
import { createExponentialBackoffFetch } from '@romulus/fetch-retry'
import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'

import type { UserSettingsRouter } from './router'

export class UserSettingsClient {
  private client: ReturnType<typeof hc<UserSettingsRouter>>
  private sessionToken: string | undefined

  constructor(options: {
    baseUrl: string
    sessionToken: string | undefined
    fetch?: typeof fetch
  }) {
    this.client = hc<UserSettingsRouter>(options.baseUrl, {
      fetch: createExponentialBackoffFetch(options.fetch ?? fetch),
    })
    this.sessionToken = options.sessionToken
  }

  async getUserSettings() {
    const response = await this.client.settings.$get(
      {},
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new UserSettingsClientError(
        (responseBody as unknown as UserSettingsErrorResponse).error,
      )
    }
    return responseBody
  }

  async updateUserSettings(body: {
    genreRelevanceFilter: number | undefined
    showRelevanceTags: boolean
    showTypeTags: boolean
    showNsfw: boolean
    darkMode: boolean
  }) {
    const response = await this.client.settings.$put(
      {
        json: {
          genreRelevanceFilter: body.genreRelevanceFilter ?? null,
          showRelevanceTags: body.showRelevanceTags,
          showTypeTags: body.showTypeTags,
          showNsfw: body.showNsfw,
          darkMode: body.darkMode,
        },
      },
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new UserSettingsClientError(
        (responseBody as unknown as UserSettingsErrorResponse).error,
      )
    }
    return responseBody
  }
}

export class UserSettingsClientError extends CustomError {
  constructor(public readonly originalError: UserSettingsError) {
    super(originalError.name, originalError.message)
  }
}

type UserSettingsErrorResponse = {
  success: false
  error: UserSettingsError
}

type UserSettingsError = {
  name: string
  message: string
  statusCode: StatusCode
  details?: unknown
}
