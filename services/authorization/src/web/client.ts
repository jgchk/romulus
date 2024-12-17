import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'

import { CustomError } from '../domain/authorizer'
import type { Router } from './router'

export class AuthorizationClient {
  private client: ReturnType<typeof hc<Router>>
  private sessionToken: string | undefined

  constructor(baseUrl: string, sessionToken: string | undefined) {
    this.client = hc<Router>(baseUrl)
    this.sessionToken = sessionToken
  }

  async getUserPermissions(userId: number) {
    const response = await this.client.users[':id'].permissions.$get(
      { param: { id: userId.toString() } },
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new AuthorizationClientError(
        (responseBody as unknown as AuthorizationErrorResponse).error,
      )
    }
    const permissions = new Set(responseBody.permissions)
    return { success: true, permissions } as const
  }
}

export class AuthorizationClientError extends CustomError {
  constructor(public readonly originalError: AuthorizationError) {
    super(originalError.name, originalError.message)
  }
}

type AuthorizationErrorResponse = {
  success: false
  error: AuthorizationError
}

type AuthorizationError = {
  name: string
  message: string
  statusCode: StatusCode
  details?: unknown
}
