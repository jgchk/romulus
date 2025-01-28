import { createExponentialBackoffFetch } from '@romulus/fetch-retry'
import type { InferResponseType } from 'hono/client'
import { hc } from 'hono/client'
import { err, ok, ResultAsync } from 'neverthrow'

import { CustomError } from '../domain/authorizer'
import type { Router } from './router'

export class AuthorizationClient {
  private client: ReturnType<typeof hc<Router>>
  private sessionToken: string | undefined

  constructor(baseUrl: string, sessionToken: string | undefined) {
    this.client = hc<Router>(baseUrl, { fetch: createExponentialBackoffFetch(fetch) })
    this.sessionToken = sessionToken
  }

  createPermission(name: string, description: string | undefined) {
    return ResultAsync.fromPromise(
      this.client.permissions.$post(
        { json: { permission: { name, description } } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.permissions.$post>>((res) => res.json())
      .andThen((res) => (res.success ? ok(res) : err(res)))
  }

  ensurePermissions(permissions: { name: string; description: string | undefined }[]) {
    return ResultAsync.fromPromise(
      this.client.permissions.$put(
        { json: { permissions } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.permissions.$put>>((res) => res.json())
      .andThen((res) => (res.success ? ok(res) : err(res)))
  }

  deletePermission(name: string) {
    return ResultAsync.fromPromise(
      this.client.permissions[':name'].$delete(
        { param: { name } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.permissions)[':name']['$delete']>>((res) =>
        res.json(),
      )
      .andThen((res) => (res.success ? ok(res) : err(res)))
  }

  createRole(name: string, permissions: Set<string>, description: string | undefined) {
    return ResultAsync.fromPromise(
      this.client.roles.$post(
        { json: { role: { name, permissions: [...permissions], description } } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.roles.$post>>((res) => res.json())
      .andThen((res) => (res.success ? ok(res) : err(res)))
  }

  deleteRole(name: string) {
    return ResultAsync.fromPromise(
      this.client.roles[':name'].$delete(
        { param: { name } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.roles)[':name']['$delete']>>((res) => res.json())
      .andThen((res) => (res.success ? ok(res) : err(res)))
  }

  assignRoleToUser(userId: number, roleName: string) {
    return ResultAsync.fromPromise(
      this.client.users[':id'].roles.$put(
        { param: { id: userId }, json: { name: roleName } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.users)[':id']['roles']['$put']>>((res) =>
        res.json(),
      )
      .andThen((res) => (res.success ? ok(res) : err(res)))
  }

  checkMyPermission(permission: string) {
    return ResultAsync.fromPromise(
      this.client.me.permissions[':permission'].$get(
        { param: { permission } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<(typeof this.client.me.permissions)[':permission']['$get']>>((res) =>
        res.json(),
      )
      .andThen((res) => (res.success ? ok(res) : err(res)))
  }

  getMyPermissions() {
    return ResultAsync.fromPromise(
      this.client.me.permissions.$get(
        {},
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
      (err) => new FetchError(toError(err)),
    )
      .map<InferResponseType<typeof this.client.me.permissions.$get>>((res) => res.json())
      .andThen((res) => (res.success ? ok(res) : err(res)))
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
