import { testClient } from 'hono/testing'
import { describe, expect } from 'vitest'

import {
  CreateApiKeyCommand,
  DeleteAccountCommand,
  DeleteApiKeyCommand,
  GetAccountQuery,
  GetAccountsQuery,
  GetApiKeysByAccountQuery,
  LoginCommand,
  LogoutCommand,
  RefreshSessionCommand,
  RegisterCommand,
  RequestPasswordResetCommand,
  ResetPasswordCommand,
  ValidateApiKeyCommand,
  WhoamiQuery,
} from '../application/index.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import { MockAuthorizationService } from '../test/mock-authorization-service.js'
import { test } from '../vitest-setup.js'
import { CommandsCompositionRoot } from './composition-root.js'
import { createAuthenticationRouter } from './router.js'

function setup(dbConnection: IDrizzleConnection) {
  const authorization = new MockAuthorizationService()

  const di = new CommandsCompositionRoot(dbConnection)
  const app = createAuthenticationRouter({
    loginCommand: () =>
      new LoginCommand(
        di.accountRepository(),
        di.sessionRepository(),
        di.passwordHashRepository(),
        di.sessionTokenHashRepository(),
        di.sessionTokenGenerator(),
      ),
    logoutCommand: () => new LogoutCommand(di.sessionRepository(), di.sessionTokenHashRepository()),
    registerCommand: () =>
      new RegisterCommand(
        di.accountRepository(),
        di.sessionRepository(),
        di.passwordHashRepository(),
        di.sessionTokenHashRepository(),
        di.sessionTokenGenerator(),
      ),
    deleteAccountCommand: () => new DeleteAccountCommand(di.accountRepository(), authorization),
    requestPasswordResetCommand: () =>
      new RequestPasswordResetCommand(
        di.passwordResetTokenRepository(),
        di.passwordResetTokenGenerator(),
        di.passwordResetTokenHashRepository(),
        di.accountRepository(),
        authorization,
      ),
    resetPasswordCommand: () =>
      new ResetPasswordCommand(
        di.accountRepository(),
        di.sessionRepository(),
        di.passwordResetTokenRepository(),
        di.passwordResetTokenHashRepository(),
        di.passwordHashRepository(),
        di.sessionTokenHashRepository(),
        di.sessionTokenGenerator(),
      ),
    whoamiQuery: () =>
      new WhoamiQuery(
        di.accountRepository(),
        di.sessionRepository(),
        di.sessionTokenHashRepository(),
      ),
    getAccountQuery: () => new GetAccountQuery(di.accountRepository()),
    getAccountsQuery: () => new GetAccountsQuery(di.accountRepository()),
    refreshSessionCommand: () =>
      new RefreshSessionCommand(di.sessionRepository(), di.sessionTokenHashRepository()),
    createApiKeyCommand: () =>
      new CreateApiKeyCommand(
        di.apiKeyRepository(),
        di.apiKeyTokenGenerator(),
        di.apiKeyHashRepository(),
      ),
    deleteApiKeyCommand: () => new DeleteApiKeyCommand(di.apiKeyRepository()),
    getApiKeysByAccountQuery: () => new GetApiKeysByAccountQuery(di.dbConnection()),
    validateApiKeyCommand: () =>
      new ValidateApiKeyCommand(di.apiKeyRepository(), di.apiKeyHashRepository()),
  })
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

    const whoamiResponse = await client.whoami.$get({
      header: { authorization: `Bearer ${sessionToken}` },
    })
    const whoamiBody = await whoamiResponse.json()
    if (whoamiBody.success === false) {
      expect.fail(`Failed to get registered user: ${whoamiBody.error.message}`)
    }
    const account = whoamiBody.account

    return { sessionToken, account }
  }

  return { client, registerTestUser, authorization }
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
        name: 'InvalidLoginError',
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
        name: 'InvalidLoginError',
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

    const res = await client.logout.$post({ header: { authorization: `Bearer ${sessionToken}` } })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
  })

  test('should error if the authorization header is empty', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.logout.$post({ header: { authorization: '' } })

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

    const res = await client.logout.$post({ header: { authorization: 'Bearer invalid-token' } })

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
        name: 'ValidationError',
        message: 'Request validation failed',
        statusCode: 400,
        details: {
          target: 'json',
          issues: [
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
        name: 'ValidationError',
        message: 'Request validation failed',
        statusCode: 400,
        details: {
          target: 'json',
          issues: [
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

describe('delete-account', () => {
  test('should error if the authorization header is empty', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.accounts[':id'].$delete({
      param: { id: 1 },
      header: { authorization: '' },
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
    const { client, registerTestUser, authorization } = setup(dbConnection)
    const { sessionToken } = await registerTestUser({ username: 'user1' })
    authorization.hasPermission.mockResolvedValue(false)

    const res = await client.accounts[':id'].$delete({
      param: { id: 99 },
      header: { authorization: `Bearer ${sessionToken}` },
    })

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

  test('should delete a user', async ({ dbConnection }) => {
    const { client, registerTestUser } = setup(dbConnection)

    const { sessionToken } = await registerTestUser()

    const res = await client.accounts[':id'].$delete({
      param: { id: 1 },
      header: { authorization: `Bearer ${sessionToken}` },
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
    })
  })
})

describe('request-password-reset', () => {
  test('should error if the authorization header is empty', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client['request-password-reset'][':userId'].$post({
      param: { userId: 1 },
      header: { authorization: '' },
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
    const { client, registerTestUser, authorization } = setup(dbConnection)
    const { sessionToken } = await registerTestUser({ username: 'user1' })
    authorization.hasPermission.mockResolvedValue(false)

    const res = await client['request-password-reset'][':userId'].$post({
      param: { userId: 1 },
      header: { authorization: `Bearer ${sessionToken}` },
    })

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
    const { client, registerTestUser } = setup(dbConnection)

    const { sessionToken } = await registerTestUser()

    const res = await client['request-password-reset'][':userId'].$post({
      param: { userId: 1 },
      header: { authorization: `Bearer ${sessionToken}` },
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      passwordResetLink: expect.stringMatching(
        /^https:\/\/www\.romulus\.lol\/reset-password\/[a-f0-9]+$/,
      ) as string,
    })
  })

  test('should error if the requested user does not exist', async ({ dbConnection }) => {
    const { client, registerTestUser } = setup(dbConnection)

    const { sessionToken } = await registerTestUser()

    const res = await client['request-password-reset'][':userId'].$post({
      param: { userId: 2 },
      header: { authorization: `Bearer ${sessionToken}` },
    })

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
    const { client, registerTestUser, authorization } = setup(dbConnection)
    const { sessionToken } = await registerTestUser()
    authorization.hasPermission.mockResolvedValue(false)

    const res = await client['request-password-reset'][':userId'].$post({
      param: { userId: 1 },
      header: { authorization: `Bearer ${sessionToken}` },
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
})

describe('whoami', () => {
  test('should return the current user', async ({ dbConnection }) => {
    const { client, registerTestUser } = setup(dbConnection)
    const { sessionToken } = await registerTestUser()

    const res = await client.whoami.$get({ header: { authorization: `Bearer ${sessionToken}` } })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      account: {
        id: 1,
        username: 'test',
      },
      session: {
        expiresAt: expect.any(String) as string,
      },
    })
  })

  test('should error if the authorization header is empty', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.whoami.$get({
      header: { authorization: '' },
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

  test('should error if the session does not exist', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)
    const res = await client.whoami.$get({
      header: { authorization: 'Bearer invalid-session-token' },
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
})

describe('get-account', () => {
  test('should return the requested account', async ({ dbConnection }) => {
    const { client, registerTestUser } = setup(dbConnection)

    await registerTestUser()

    const res = await client.accounts[':id'].$get({
      param: { id: 1 },
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      account: {
        id: 1,
        username: 'test',
      },
    })
  })

  test('should error if the requested account does not exist', async ({ dbConnection }) => {
    const { client } = setup(dbConnection)

    const res = await client.accounts[':id'].$get({
      param: { id: 2 },
    })

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

describe('get-accounts', () => {
  test('should return the requested account when only one account is requested', async ({
    dbConnection,
  }) => {
    const { client, registerTestUser } = setup(dbConnection)

    await registerTestUser()

    const res = await client.accounts.$get({
      query: { id: [1] },
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      accounts: [
        {
          id: 1,
          username: 'test',
        },
      ],
    })
  })
})
