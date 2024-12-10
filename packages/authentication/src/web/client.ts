import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'

import { CustomError } from '../domain/errors/base'
import type { Router } from './router'

export class AuthenticationClient {
  private client: ReturnType<typeof hc<Router>>
  private sessionToken: string | undefined

  constructor(baseUrl: string, sessionToken: string | undefined) {
    this.client = hc<Router>(baseUrl)
    this.sessionToken = sessionToken
  }

  async login(body: { username: string; password: string }) {
    const response = await this.client.login.$post({ json: body })
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new AuthenticationClientError(responseBody.error)
    }
    return responseBody
  }

  async logout() {
    const response = await this.client.logout.$post(
      {},
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    return responseBody
  }

  async register(body: { username: string; password: string }) {
    const response = await this.client.register.$post({ json: body })
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new AuthenticationClientError(responseBody.error)
    }
    return responseBody
  }

  async requestPasswordReset(body: { accountId: number }) {
    const response = await this.client['request-password-reset'][':accountId'].$post(
      { param: { accountId: body.accountId.toString() } },
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new AuthenticationClientError(responseBody.error)
    }
    return responseBody
  }

  async resetPassword(body: { passwordResetToken: string; newPassword: string }) {
    const response = await this.client['reset-password'][':token'].$post({
      param: { token: body.passwordResetToken },
      json: { password: body.newPassword },
    })
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new AuthenticationClientError(responseBody.error)
    }
    return responseBody
  }

  async whoami() {
    const response = await this.client.whoami.$get(
      {},
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new AuthenticationClientError(responseBody.error)
    }
    return responseBody
  }

  async getAccount(body: { accountId: number }) {
    const response = await this.client.account[':id'].$get(
      { param: { id: body.accountId.toString() } },
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new AuthenticationClientError(responseBody.error)
    }
    return responseBody
  }

  async refreshSession() {
    const response = await this.client['refresh-session'].$post(
      {},
      { headers: { authorization: `Bearer ${this.sessionToken}` } },
    )
    const responseBody = await response.json()
    if (!responseBody.success) {
      return new AuthenticationClientError(responseBody.error)
    }
    return responseBody
  }
}

export class AuthenticationClientError extends CustomError {
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
