import { testClient } from 'hono/testing'
import { parseCookies } from 'oslo/cookie'
import { describe, expect } from 'vitest'

import { test as base } from '../../vitest-setup'
import type { Router } from '.'
import { createRouter } from '.'
import { CommandsCompositionRoot } from './composition-root'

const test = base.extend<{ client: ReturnType<typeof testClient<Router>> }>({
  client: async ({ dbConnection }, use) => {
    const di = new CommandsCompositionRoot(dbConnection, 'auth_session')
    const app = createRouter(di)
    const client = testClient(app)
    await use(client)
  },
})

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
  test('should error when no user is found', async ({ client }) => {
    const res = await client.login.$post({ json: { username: 'test', password: 'test' } })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      error: {
        message: 'Incorrect username or password',
        name: 'InvalidLogin',
      },
    })
  })

  test('should error when password is incorrect', async ({ client }) => {
    const res = await client.login.$post({ json: { username: 'test', password: 'test' } })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      error: {
        message: 'Incorrect username or password',
        name: 'InvalidLogin',
      },
    })
  })

  test('should log in when credentials are correct', async ({ client }) => {
    await client.register.$post({ json: { username: 'test', password: 'x'.repeat(8) } })

    const res = await client.login.$post({ json: { username: 'test', password: 'x'.repeat(8) } })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(getCookieValue(res, 'auth_session')).toBeDefined()
  })
})

describe('logout', () => {
  test('should log out the user', async ({ client }) => {
    const registerResponse = await client.register.$post({
      json: { username: 'test', password: 'x'.repeat(8) },
    })

    const res = await client.logout.$post({}, { headers: { cookie: getCookies(registerResponse) } })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(getCookieValue(res, 'auth_session')).toBeDefined()
  })

  test('should succeed even if the user is not logged in', async ({ client }) => {
    const res = await client.logout.$post()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(getCookieValue(res, 'auth_session')).toBeUndefined()
  })
})

describe('register', () => {
  test('should register a valid user', async ({ client }) => {
    const res = await client.register.$post({ json: { username: 'test', password: 'x'.repeat(8) } })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(getCookieValue(res, 'auth_session')).toBeDefined()
  })

  test('should error if password is not long enough', async ({ client }) => {
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

  test('should error if password is too long', async ({ client }) => {
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

  test('should error if the username is already taken', async ({ client }) => {
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
  test('should error if the user is not logged in', async ({ client }) => {
    const res = await client['request-password-reset'][':accountId'].$post({
      param: { accountId: '1' },
    })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      error: {
        name: 'SessionNotFoundError',
        message: 'No session found',
      },
    })
  })

  test('should error if the user is not authorized', async ({ client }) => {
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

  test('should return a password reset link', async ({ client }) => {
    const registerResponse = await client.register.$post({
      json: { username: 'test', password: 'x'.repeat(8) },
    })

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

  test('should error if the requested user does not exist', async ({ client }) => {
    const registerResponse = await client.register.$post({
      json: { username: 'test', password: 'x'.repeat(8) },
    })

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
})

describe('whoami', () => {
  test('should return the current user', async ({ client }) => {
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

  test('should return null if the user is not logged in', async ({ client }) => {
    const res = await client.whoami.$get()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      account: null,
      session: null,
    })
  })
})
