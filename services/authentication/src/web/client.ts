import { createExponentialBackoffFetch } from '@romulus/fetch-retry'
import type { InferResponseType } from 'hono/client'
import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'

import { CustomError } from '../domain/errors/base'
import type { Router } from './router'

export type IAuthenticationClient = {
  login(body: {
    username: string
    password: string
  }): ResultAsync<{ token: string; expiresAt: Date }, FetchError | AuthenticationClientError>

  logout(): ResultAsync<void, FetchError>

  register(body: {
    username: string
    password: string
  }): ResultAsync<{ token: string; expiresAt: Date }, FetchError | AuthenticationClientError>

  requestPasswordReset(body: {
    accountId: number
  }): ResultAsync<{ passwordResetLink: string }, FetchError | AuthenticationClientError>

  resetPassword(body: { passwordResetToken: string; newPassword: string }): ResultAsync<
    {
      token: string
      expiresAt: Date
    },
    FetchError | AuthenticationClientError
  >

  whoami(): ResultAsync<
    {
      account: {
        id: number
        username: string
      }
      session: {
        expiresAt: Date
      }
    },
    FetchError | AuthenticationClientError
  >

  getAccount(body: { accountId: number }): ResultAsync<
    {
      id: number
      username: string
    },
    FetchError | AuthenticationClientError
  >

  getAccounts(
    ids: number[],
  ): ResultAsync<{ id: number; username: string }[], FetchError | AuthenticationClientError>

  refreshSession(): ResultAsync<
    { token: string; expiresAt: Date },
    FetchError | AuthenticationClientError
  >
}

export class AuthenticationClient implements IAuthenticationClient {
  private client: ReturnType<typeof hc<Router>>
  private sessionToken: string | undefined

  constructor(baseUrl: string, sessionToken: string | undefined) {
    this.client = hc<Router>(baseUrl, { fetch: createExponentialBackoffFetch(fetch) })
    this.sessionToken = sessionToken
  }

  login(body: { username: string; password: string }) {
    return ResultAsync.fromPromise(
      this.client.login.$post({ json: body }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.login.$post>>((res) => res.json())
      .andThen((res) => {
        if (res.success) return okAsync({ token: res.token, expiresAt: new Date(res.expiresAt) })
        return errAsync(new AuthenticationClientError(res.error))
      })
  }

  logout() {
    return ResultAsync.fromPromise(
      this.client.logout.$post({}, { headers: { authorization: `Bearer ${this.sessionToken}` } }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.logout.$post>>((res) => res.json())
      .andThen(() => okAsync(undefined))
  }

  register(body: { username: string; password: string }) {
    return ResultAsync.fromPromise(
      this.client.register.$post({ json: body }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.register.$post>>((res) => res.json())
      .andThen((res) => {
        if (res.success) return okAsync({ token: res.token, expiresAt: new Date(res.expiresAt) })
        return errAsync(new AuthenticationClientError(res.error))
      })
  }

  requestPasswordReset(body: { accountId: number }) {
    return ResultAsync.fromPromise(
      this.client['request-password-reset'][':accountId'].$post(
        { param: { accountId: body.accountId.toString() } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<
        InferResponseType<(typeof this.client)['request-password-reset'][':accountId']['$post']>
      >((res) => res.json())
      .andThen((res) => {
        if (res.success) return okAsync({ passwordResetLink: res.passwordResetLink })
        return errAsync(new AuthenticationClientError(res.error))
      })
  }

  resetPassword(body: { passwordResetToken: string; newPassword: string }) {
    return ResultAsync.fromPromise(
      this.client['reset-password'][':token'].$post({
        param: { token: body.passwordResetToken },
        json: { password: body.newPassword },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client)['reset-password'][':token']['$post']>>((res) =>
        res.json(),
      )
      .andThen((res) => {
        if (res.success) return okAsync({ token: res.token, expiresAt: new Date(res.expiresAt) })
        return errAsync(new AuthenticationClientError(res.error))
      })
  }

  whoami() {
    return ResultAsync.fromPromise(
      this.client.whoami.$get({}, { headers: { authorization: `Bearer ${this.sessionToken}` } }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.whoami.$get>>((res) => res.json())
      .andThen((res) => {
        if (res.success)
          return okAsync({
            account: { id: res.account.id, username: res.account.username },
            session: { expiresAt: new Date(res.session.expiresAt) },
          })
        return errAsync(new AuthenticationClientError(res.error))
      })
  }

  getAccount(body: { accountId: number }) {
    return ResultAsync.fromPromise(
      this.client.accounts[':id'].$get(
        { param: { id: body.accountId.toString() } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.accounts)[':id']['$get']>>((res) => res.json())
      .andThen((res) => {
        if (res.success) return okAsync({ id: res.account.id, username: res.account.username })
        return errAsync(new AuthenticationClientError(res.error))
      })
  }

  getAccounts(ids: number[]) {
    return ResultAsync.fromPromise(
      this.client.accounts.$get(
        { query: { id: ids.map((id) => id.toString()) } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client)['accounts']['$get']>>((res) => res.json())
      .map((res) => res.accounts.map((account) => ({ id: account.id, username: account.username })))
  }

  refreshSession() {
    return ResultAsync.fromPromise(
      this.client['refresh-session'].$post(
        {},
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client)['refresh-session']['$post']>>((res) => res.json())
      .andThen((res) => {
        if (res.success) return okAsync({ token: res.token, expiresAt: new Date(res.expiresAt) })
        return errAsync(new AuthenticationClientError(res.error))
      })
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
