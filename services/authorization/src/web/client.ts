import { createExponentialBackoffFetch } from '@romulus/fetch-retry'
import type { InferResponseType } from 'hono/client'
import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'

import { CustomError } from '../domain/authorizer'
import type { Router } from './router'

export type IAuthorizationClient = {
  createPermission(
    name: string,
    description: string | undefined,
  ): ResultAsync<void, AuthorizationClientError>

  ensurePermissions(
    permissions: { name: string; description?: string }[],
  ): ResultAsync<void, AuthorizationClientError>

  deletePermission(name: string): ResultAsync<void, AuthorizationClientError>

  createRole(
    name: string,
    permissions: Set<string>,
    description: string | undefined,
  ): ResultAsync<void, AuthorizationClientError>

  deleteRole(name: string): ResultAsync<void, AuthorizationClientError>

  assignRoleToUser(userId: string, roleName: string): ResultAsync<void, AuthorizationClientError>

  checkMyPermission(permission: string): ResultAsync<boolean, AuthorizationClientError>

  getMyPermissions(): ResultAsync<Set<string>, AuthorizationClientError>
}

export class AuthorizationClient implements IAuthorizationClient {
  private client: ReturnType<typeof hc<Router>>
  private sessionToken: string | undefined

  constructor(baseUrl: string, sessionToken: string | undefined) {
    this.client = hc<Router>(baseUrl, { fetch: createExponentialBackoffFetch(fetch) })
    this.sessionToken = sessionToken
  }

  createPermission(name: string, description: string | undefined) {
    return ResultAsync.fromSafePromise(
      this.client.permissions.$post(
        { json: { permission: { name, description } } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
    )
      .map<InferResponseType<typeof this.client.permissions.$post>>((res) => res.json())
      .andThen((res) => {
        if (res.success) return okAsync(undefined)
        return errAsync(new AuthorizationClientError(res.error))
      })
  }

  ensurePermissions(permissions: { name: string; description: string | undefined }[]) {
    return ResultAsync.fromSafePromise(
      this.client.permissions.$put(
        { json: { permissions } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
    )
      .map<InferResponseType<typeof this.client.permissions.$put>>((res) => res.json())
      .andThen((res) => {
        if (res.success) return okAsync(undefined)
        return errAsync(new AuthorizationClientError(res.error))
      })
  }

  deletePermission(name: string) {
    return ResultAsync.fromSafePromise(
      this.client.permissions[':name'].$delete(
        { param: { name } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
    )
      .map<InferResponseType<(typeof this.client.permissions)[':name']['$delete']>>((res) =>
        res.json(),
      )
      .andThen((res) => {
        if (res.success) return okAsync(undefined)
        return errAsync(new AuthorizationClientError(res.error))
      })
  }

  createRole(name: string, permissions: Set<string>, description: string | undefined) {
    return ResultAsync.fromSafePromise(
      this.client.roles.$post(
        { json: { role: { name, permissions: [...permissions], description } } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
    )
      .map<InferResponseType<typeof this.client.roles.$post>>((res) => res.json())
      .andThen((res) => {
        if (res.success) return okAsync(undefined)
        return errAsync(new AuthorizationClientError(res.error))
      })
  }

  deleteRole(name: string) {
    return ResultAsync.fromSafePromise(
      this.client.roles[':name'].$delete(
        { param: { name } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
    )
      .map<InferResponseType<(typeof this.client.roles)[':name']['$delete']>>((res) => res.json())
      .andThen((res) => {
        if (res.success) return okAsync(undefined)
        return errAsync(new AuthorizationClientError(res.error))
      })
  }

  assignRoleToUser(userId: string, roleName: string) {
    return ResultAsync.fromSafePromise(
      this.client.users[':id'].roles.$put(
        { param: { id: userId.toString() }, json: { name: roleName } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
    )
      .map<InferResponseType<(typeof this.client.users)[':id']['roles']['$put']>>((res) =>
        res.json(),
      )
      .andThen((res) => {
        if (res.success) return okAsync(undefined)
        return errAsync(new AuthorizationClientError(res.error))
      })
  }

  checkMyPermission(permission: string) {
    return ResultAsync.fromSafePromise(
      this.client.me.permissions[':permission'].$get(
        { param: { permission } },
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
    )
      .map<InferResponseType<(typeof this.client.me.permissions)[':permission']['$get']>>((res) =>
        res.json(),
      )
      .map((res) => res.hasPermission)
  }

  getMyPermissions() {
    return ResultAsync.fromSafePromise(
      this.client.me.permissions.$get(
        {},
        { headers: { authorization: `Bearer ${this.sessionToken}` } },
      ),
    )
      .map<InferResponseType<typeof this.client.me.permissions.$get>>((res) => res.json())
      .andThen((res) => {
        if (res.success) return okAsync(new Set(res.permissions))
        return errAsync(new AuthorizationClientError((res as AuthorizationErrorResponse).error))
      })
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
