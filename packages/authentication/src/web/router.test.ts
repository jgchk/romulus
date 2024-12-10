import { testClient } from 'hono/testing'
import { describe, expect } from 'vitest'

import { AuthenticationPermission } from '../domain/permissions'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database'
import { MemoryAuthorizationService } from '../infrastructure/memory-authorization-service'
import { test } from '../vitest-setup'
import { CommandsCompositionRoot } from './composition-root'
import { createRouter } from './router'

function setup(dbConnection: IDrizzleConnection) {
  const authorizationService = new MemoryAuthorizationService()
  const di = new CommandsCompositionRoot(dbConnection, authorizationService)
  const app = createRouter(di)
  const client = testClient(app)

  async function registerTestUser(user?: { username?: string; password?: string }) {
    const registerResponse = await client.register.$post({
      json: { username: user?.username ?? 'test', password: user?.password ?? 'x'.repeat(8) },
    })
    const registerBody = await registerResponse.json()
    if (registerBody.success === false) {
      expect.fail(`Failed to register user: ${registerBody.error.message}`)
    }
    const sessionToken = registerBody.token

    const whoamiResponse = await client.whoami.$get(
      {},
      { headers: { authorization: `Bearer ${sessionToken}` } },
    )
    const whoamiBody = await whoamiResponse.json()
    if (whoamiBody.success === false) {
      expect.fail(`Failed to get registered user: ${whoamiBody.error.message}`)
    }
    const account = whoamiBody.account

    return { sessionToken, account }
  }

  return { client, authorizationService, registerTestUser }
}

describe('login', () => {
  test('should error when no user is found', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.login.$post({ json: { username: 'test', password: 'test' } })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        message: 'Incorrect username or password',
        name: 'InvalidLogin',
        statusCode: 401,
      },
    })
  })

  test('should error when password is incorrect', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.login.$post({ json: { username: 'test', password: 'test' } })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        message: 'Incorrect username or password',
        name: 'InvalidLogin',
        statusCode: 401,
      },
    })
  })

  test('should log in when credentials are correct', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    await client.register.$post({ json: { username: 'test', password: 'x'.repeat(8) } })

    const res = await client.login.$post({ json: { username: 'test', password: 'x'.repeat(8) } })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      token: expect.any(String) as string,
      expiresAt: expect.any(String) as string,
    })
  })
})

describe('logout', () => {
  test('should log out the user', async ({ dbConnection }) => {
    const { client, registerTestUser } = setup(dbConnection)
    const { sessionToken } = await registerTestUser()

    const res = await client.logout.$post(
      {},
      { headers: { authorization: `Bearer ${sessionToken}` } },
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
  })

  test('should error if the user is not logged in', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.logout.$post({})

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized to perform this action',
        statusCode: 401,
      },
    })
  })

  test('should pretend to log out even if the session token is invalid', async ({
    dbConnection,
  }) => {
    const { client } = setup(dbConnection)

    const res = await client.logout.$post(
      {},
      { headers: { authorization: 'Bearer invalid-token' } },
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
  })
})

describe('register', () => {
  test('should register a valid user', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.register.$post({ json: { username: 'test', password: 'x'.repeat(8) } })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      token: expect.any(String) as string,
      expiresAt: expect.any(String) as string,
    })
  })

  test('should error if password is not long enough', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.register.$post({ json: { username: 'test', password: 'x'.repeat(7) } })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'InvalidRequestError',
        message: 'Invalid request',
        statusCode: 400,
        details: [
          {
            code: 'too_small',
            exact: false,
            inclusive: true,
            message: 'String must contain at least 8 character(s)',
            minimum: 8,
            path: ['password'],
            type: 'string',
          },
        ],
      },
    })
  })

  test('should error if password is too long', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.register.$post({
      json: { username: 'test', password: 'x'.repeat(73) },
    })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'InvalidRequestError',
        message: 'Invalid request',
        statusCode: 400,
        details: [
          {
            code: 'too_big',
            exact: false,
            inclusive: true,
            message: 'String must contain at most 72 character(s)',
            maximum: 72,
            path: ['password'],
            type: 'string',
          },
        ],
      },
    })
  })

  test('should error if the username is already taken', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    await client.register.$post({ json: { username: 'test', password: 'x'.repeat(8) } })

    const res = await client.register.$post({ json: { username: 'test', password: 'x'.repeat(8) } })

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'NonUniqueUsernameError',
        message: 'Username is already taken',
        statusCode: 409,
      },
    })
  })
})

describe('request-password-reset', () => {
  test('should error if the user is not logged in', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client['request-password-reset'][':accountId'].$post({
      param: { accountId: '1' },
    })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized to perform this action',
        statusCode: 401,
      },
    })
  })

  test('should error if the user is not authorized', async ({ dbConnection }) => {
    const { client, registerTestUser } = setup(dbConnection)
    const { sessionToken } = await registerTestUser({ username: 'user1' })

    const res = await client['request-password-reset'][':accountId'].$post(
      { param: { accountId: '1' } },
      { headers: { authorization: `Bearer ${sessionToken}` } },
    )

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        message: 'You are not authorized to perform this action',
        name: 'UnauthorizedError',
        statusCode: 401,
      },
    })
  })

  test('should return a password reset link', async ({ dbConnection }) => {
    const { client, authorizationService, registerTestUser } = setup(dbConnection)
    const { sessionToken, account } = await registerTestUser()
    authorizationService.setUserPermissions(
      account.id,
      new Set([AuthenticationPermission.RequestPasswordReset]),
    )

    const res = await client['request-password-reset'][':accountId'].$post(
      { param: { accountId: '1' } },
      { headers: { authorization: `Bearer ${sessionToken}` } },
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      passwordResetLink: expect.stringMatching(
        /^https:\/\/www\.romulus\.lol\/reset-password\/[a-f0-9]+$/,
      ) as string,
    })
  })

  test('should error if the requested user does not exist', async ({ dbConnection }) => {
    const { client, authorizationService, registerTestUser } = setup(dbConnection)
    const { sessionToken, account } = await registerTestUser()
    authorizationService.setUserPermissions(
      account.id,
      new Set([AuthenticationPermission.RequestPasswordReset]),
    )

    const res = await client['request-password-reset'][':accountId'].$post(
      { param: { accountId: '2' } },
      { headers: { authorization: `Bearer ${sessionToken}` } },
    )

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'AccountNotFoundError',
        message: 'Account not found',
        statusCode: 404,
      },
    })
  })

  test('should error if the requestor does not have the required permission', async ({
    dbConnection,
  }) => {
    const { client, registerTestUser } = setup(dbConnection)
    const { sessionToken } = await registerTestUser()

    const res = await client['request-password-reset'][':accountId'].$post(
      { param: { accountId: '1' } },
      { headers: { authorization: `Bearer ${sessionToken}` } },
    )

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized to perform this action',
        statusCode: 401,
      },
    })
  })
})

describe('whoami', () => {
  test('should return the current user', async ({ dbConnection }) => {
    const { client, registerTestUser } = setup(dbConnection)
    const { sessionToken } = await registerTestUser()

    const res = await client.whoami.$get(
      {},
      { headers: { authorization: `Bearer ${sessionToken}` } },
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      account: {
        darkMode: true,
        genreRelevanceFilter: 0,
        id: 1,
        showNsfw: false,
        showRelevanceTags: false,
        showTypeTags: true,
        username: 'test',
      },
      session: {
        expiresAt: expect.any(String) as string,
      },
    })
  })

  test('should error if the user is not logged in', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.whoami.$get()

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized to perform this action',
        statusCode: 401,
      },
    })
  })

  test('should error if the session does not exist', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.whoami.$get(
      {},
      { headers: { authorization: 'Bearer invalid-session-token' } },
    )

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized to perform this action',
        statusCode: 401,
      },
    })
  })
})

describe('get-account', () => {
  test('should return the requested account', async ({ dbConnection }) => {
    const { client, registerTestUser, authorizationService } = setup(dbConnection)
    const { sessionToken } = await registerTestUser()
    authorizationService.setUserPermissions(1, new Set([AuthenticationPermission.GetAccount]))

    const res = await client.account[':id'].$get(
      { param: { id: '1' } },
      { headers: { authorization: `Bearer ${sessionToken}` } },
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      account: {
        darkMode: true,
        genreRelevanceFilter: 0,
        id: 1,
        showNsfw: false,
        showRelevanceTags: false,
        showTypeTags: true,
        username: 'test',
      },
    })
  })

  test('should error if the user does not have permission', async ({ dbConnection }) => {
    const { client, registerTestUser } = setup(dbConnection)
    const { sessionToken } = await registerTestUser()

    const res = await client.account[':id'].$get(
      { param: { id: '1' } },
      { headers: { authorization: `Bearer ${sessionToken}` } },
    )

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized to perform this action',
        statusCode: 401,
      },
    })
  })

  test('should error if the user is not logged in', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.account[':id'].$get({ param: { id: '1' } })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized to perform this action',
        statusCode: 401,
      },
    })
  })

  test('should error if the session does not exist', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.account[':id'].$get(
      { param: { id: '1' } },
      { headers: { authorization: 'Bearer invalid-session-token' } },
    )

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized to perform this action',
        statusCode: 401,
      },
    })
  })

  test('should error if the requested account does not exist', async ({ dbConnection }) => {
    const { client, registerTestUser, authorizationService } = setup(dbConnection)
    const { sessionToken } = await registerTestUser()
    authorizationService.setUserPermissions(1, new Set([AuthenticationPermission.GetAccount]))

    const res = await client.account[':id'].$get(
      { param: { id: '2' } },
      { headers: { authorization: `Bearer ${sessionToken}` } },
    )

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({
      success: false,
      error: {
        name: 'AccountNotFoundError',
        message: 'Account not found',
        statusCode: 404,
      },
    })
  })
})
