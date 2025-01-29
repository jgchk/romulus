import { createExponentialBackoffFetch } from '@romulus/fetch-retry'
import type { InferResponseType } from 'hono/client'
import { hc } from 'hono/client'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'

import { CustomError } from '../domain/errors/base.js'
import type { Router } from './router.js'

export class AuthenticationClient {
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
        if (res.success)
          return okAsync({
            success: true,
            token: res.token,
            expiresAt: new Date(res.expiresAt),
          } as const)
        return errAsync({ success: false, error: res.error } as const)
      })
  }

  logout() {
    return ResultAsync.fromPromise(
      this.client.logout.$post({
        header: {
          authorization: `Bearer ${this.sessionToken}`,
        },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.logout.$post>>((res) => res.json())
      .andThen((res) => {
        if (res.success)
          return okAsync({
            success: true,
          } as const)
        return errAsync({ success: false, error: res.error } as const)
      })
  }

  register(body: { username: string; password: string }) {
    return ResultAsync.fromPromise(
      this.client.register.$post({ json: body }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.register.$post>>((res) => res.json())
      .andThen((res) => {
        if (res.success)
          return okAsync({
            success: true,
            token: res.token,
            expiresAt: new Date(res.expiresAt),
          } as const)
        return errAsync({ success: false, error: res.error } as const)
      })
  }

  requestPasswordReset(body: { userId: number }) {
    return ResultAsync.fromPromise(
      this.client['request-password-reset'][':userId'].$post({
        param: { userId: body.userId },
        header: {
          authorization: `Bearer ${this.sessionToken}`,
        },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client)['request-password-reset'][':userId']['$post']>>(
        (res) => res.json(),
      )
      .andThen((res) => {
        if (res.success)
          return okAsync({ success: true, passwordResetLink: res.passwordResetLink } as const)
        return errAsync({ success: false, error: res.error } as const)
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
        if (res.success)
          return okAsync({
            success: true,
            token: res.token,
            expiresAt: new Date(res.expiresAt),
          } as const)
        return errAsync({ success: false, error: res.error } as const)
      })
  }

  whoami() {
    return ResultAsync.fromPromise(
      this.client.whoami.$get({
        header: {
          authorization: `Bearer ${this.sessionToken}`,
        },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.whoami.$get>>((res) => res.json())
      .andThen((res) => {
        if (res.success)
          return okAsync({
            success: true,
            account: { id: res.account.id, username: res.account.username },
            session: { expiresAt: new Date(res.session.expiresAt) },
          } as const)
        return errAsync({ success: false, error: res.error } as const)
      })
  }

  getAccount(body: { id: number }) {
    return ResultAsync.fromPromise(
      this.client.accounts[':id'].$get({
        param: { id: body.id },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.accounts)[':id']['$get']>>((res) => res.json())
      .andThen((res) => {
        if (res.success)
          return okAsync({
            success: true,
            id: res.account.id,
            username: res.account.username,
          } as const)
        return errAsync({ success: false, error: res.error } as const)
      })
  }

  getAccounts(ids: number[]) {
    return ResultAsync.fromPromise(
      this.client.accounts.$get({
        query: { id: ids },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client)['accounts']['$get']>>((res) => res.json())
      .andThen((res) => {
        if (res.success)
          return okAsync({
            success: true,
            accounts: res.accounts.map((account) => ({
              id: account.id,
              username: account.username,
            })),
          } as const)
        return errAsync({ success: false, error: res.error } as const)
      })
  }

  refreshSession() {
    return ResultAsync.fromPromise(
      this.client['refresh-session'].$post({
        header: {
          authorization: `Bearer ${this.sessionToken}`,
        },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client)['refresh-session']['$post']>>((res) => res.json())
      .andThen((res) => {
        if (res.success)
          return okAsync({
            success: true,
            token: res.token,
            expiresAt: new Date(res.expiresAt),
          } as const)
        return errAsync({ success: false, error: res.error } as const)
      })
  }

  createApiKey(name: string) {
    return ResultAsync.fromPromise(
      this.client.me['api-keys'].$post({
        json: { name },
        header: {
          authorization: `Bearer ${this.sessionToken}`,
        },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.me)['api-keys']['$post']>>((res) => res.json())
      .andThen((res) => {
        if (res.success)
          return okAsync({ success: true, id: res.id, name: res.name, key: res.key } as const)
        return errAsync({ success: false, error: res.error } as const)
      })
  }

  deleteApiKey(id: number) {
    return ResultAsync.fromPromise(
      this.client.me['api-keys'][':id'].$delete({
        param: { id },
        header: {
          authorization: `Bearer ${this.sessionToken}`,
        },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.me)['api-keys'][':id']['$delete']>>((res) =>
        res.json(),
      )
      .andThen((res) => {
        if (res.success) return okAsync({ success: true } as const)
        return errAsync({ success: false, error: res.error } as const)
      })
  }

  getApiKeys() {
    return ResultAsync.fromPromise(
      this.client.me['api-keys'].$get({
        header: {
          authorization: `Bearer ${this.sessionToken}`,
        },
      }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.me)['api-keys']['$get']>>((res) => res.json())
      .andThen((res) => {
        if (res.success)
          return okAsync({
            success: true,
            keys: res.keys.map((key) => ({ ...key, createdAt: new Date(key.createdAt) })),
          } as const)
        return errAsync({ success: false, error: res.error } as const)
      })
  }

  validateApiKey(key: string) {
    return ResultAsync.fromPromise(
      this.client['validate-api-key'][':key'].$post({ param: { key } }),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client)['validate-api-key'][':key']['$post']>>((res) =>
        res.json(),
      )
      .andThen((res) => {
        if (res.success) return okAsync(res)
        return errAsync({ success: false, error: res.error } as const)
      })
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
