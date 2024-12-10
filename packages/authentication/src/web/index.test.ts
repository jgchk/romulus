import { testClient } from 'hono/testing'
import { parseCookies } from 'oslo/cookie'
import { describe, expect } from 'vitest'

import { AuthenticationPermission } from '../domain/permissions'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database'
import { MemoryAuthorizationService } from '../infrastructure/memory-authorization-service'
import { test } from '../vitest-setup'
import { createRouter } from '.'
import { CommandsCompositionRoot } from './composition-root'

function setup(dbConnection: IDrizzleConnection) {
  const authorizationService = new MemoryAuthorizationService()
  const di = new CommandsCompositionRoot(dbConnection, authorizationService)
  const app = createRouter(di)
  const client = testClient(app)
  return { client, authorizationService }
}

function getCookies(res: Response): string {
  return res.headers.get('set-cookie') ?? ''
}

function getCookieValue(res: Response, name: string): string | undefined {
  const cookieString = res.headers.get('set-cookie')
  if (cookieString === null) return

  const cookies = parseCookies(cookieString)
  return cookies.get(name)
}

describe('login', () => {
  test('should error when no user is found', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.login.$post({ json: { username: 'test', password: 'test' } })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      error: {
        message: 'Incorrect username or password',
        name: 'InvalidLogin',
      },
    })
  })

  test('should error when password is incorrect', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.login.$post({ json: { username: 'test', password: 'test' } })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      error: {
        message: 'Incorrect username or password',
        name: 'InvalidLogin',
      },
    })
  })

  test('should log in when credentials are correct', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    await client.register.$post({ json: { username: 'test', password: 'x'.repeat(8) } })

    const res = await client.login.$post({ json: { username: 'test', password: 'x'.repeat(8) } })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(getCookieValue(res, 'auth_session')).toBeDefined()
  })
})

describe('logout', () => {
  test('should log out the user', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const registerResponse = await client.register.$post({
      json: { username: 'test', password: 'x'.repeat(8) },
    })

    const res = await client.logout.$post({}, { headers: { cookie: getCookies(registerResponse) } })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(getCookieValue(res, 'auth_session')).toBeDefined()
  })

  test('should succeed even if the user is not logged in', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.logout.$post()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(getCookieValue(res, 'auth_session')).toBeUndefined()
  })
})

describe('register', () => {
  test('should register a valid user', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.register.$post({ json: { username: 'test', password: 'x'.repeat(8) } })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(getCookieValue(res, 'auth_session')).toBeDefined()
  })

  test('should error if password is not long enough', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.register.$post({ json: { username: 'test', password: 'x'.repeat(7) } })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      error: {
        name: 'InvalidRequestError',
        message: 'Invalid request',
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
      error: {
        name: 'InvalidRequestError',
        message: 'Invalid request',
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
      error: {
        name: 'NonUniqueUsernameError',
        message: 'Username is already taken',
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
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized to perform this action',
      },
    })
  })

  test('should error if the user is not authorized', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    await client.register.$post({
      json: { username: 'user1', password: 'x'.repeat(8) },
    })
    const user2RegisterResponse = await client.register.$post({
      json: { username: 'user2', password: 'x'.repeat(8) },
    })

    const res = await client['request-password-reset'][':accountId'].$post(
      { param: { accountId: '1' } },
      { headers: { cookie: getCookies(user2RegisterResponse) } },
    )

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      error: {
        message: 'You are not authorized to perform this action',
        name: 'UnauthorizedError',
      },
    })
  })

  test('should return a password reset link', async ({ dbConnection }) => {
    const { client, authorizationService } = setup(dbConnection)
    const registerResponse = await client.register.$post({
      json: { username: 'test', password: 'x'.repeat(8) },
    })
    const whoamiResponse = await client.whoami.$get(
      {},
      { headers: { cookie: getCookies(registerResponse) } },
    )
    authorizationService.setUserPermissions(
      (await whoamiResponse.json()).account.id,
      new Set([AuthenticationPermission.RequestPasswordReset]),
    )

    const res = await client['request-password-reset'][':accountId'].$post(
      { param: { accountId: '1' } },
      { headers: { cookie: getCookies(registerResponse) } },
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      passwordResetLink: expect.stringMatching(
        /^https:\/\/www\.romulus\.lol\/reset-password\/[a-f0-9]+$/,
      ) as string,
    })
  })

  test('should error if the requested user does not exist', async ({ dbConnection }) => {
    const { client, authorizationService } = setup(dbConnection)
    const registerResponse = await client.register.$post({
      json: { username: 'test', password: 'x'.repeat(8) },
    })
    const whoamiResponse = await client.whoami.$get(
      {},
      { headers: { cookie: getCookies(registerResponse) } },
    )
    authorizationService.setUserPermissions(
      (await whoamiResponse.json()).account.id,
      new Set([AuthenticationPermission.RequestPasswordReset]),
    )

    const res = await client['request-password-reset'][':accountId'].$post(
      { param: { accountId: '2' } },
      { headers: { cookie: getCookies(registerResponse) } },
    )

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({
      error: {
        name: 'AccountNotFoundError',
        message: 'Account not found',
      },
    })
  })

  test('should error if the requestor does not have the required permission', async ({
    dbConnection,
  }) => {
    const { client } = setup(dbConnection)
    const registerResponse = await client.register.$post({
      json: { username: 'test', password: 'x'.repeat(8) },
    })

    const res = await client['request-password-reset'][':accountId'].$post(
      { param: { accountId: '1' } },
      { headers: { cookie: getCookies(registerResponse) } },
    )

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized to perform this action',
      },
    })
  })
})

describe('whoami', () => {
  test('should return the current user', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const registerResponse = await client.register.$post({
      json: { username: 'test', password: 'x'.repeat(8) },
    })

    const res = await client.whoami.$get({}, { headers: { cookie: getCookies(registerResponse) } })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
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

  test('should return null if the user is not logged in', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.whoami.$get()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      account: null,
      session: null,
    })
  })
})
