import { describe, expect } from 'vitest'

import { createLucia } from '$lib/server/auth'
import type { IDrizzleConnection } from '$lib/server/db/connection'
import { passwordResetTokens } from '$lib/server/db/schema'

import { test } from '../../../../../../vitest-setup'
import {
  AuthService,
  ExpiredPasswordResetTokenError,
  InvalidLoginError,
  PasswordResetTokenNotFoundError,
} from '../application/auth-service'
import { Cookie } from '../domain/cookie'
import { PasswordResetToken } from '../domain/password-reset-token'
import { NonUniqueUsernameError } from '../infrastructure/account/account-repository'
import { DrizzleAccountRepository } from '../infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '../infrastructure/hash/bcrypt-hash-repository'
import { Sha256HashRepository } from '../infrastructure/hash/sha256-hash-repository'
import { DrizzlePasswordResetTokenRepository } from '../infrastructure/password-reset-token/drizzle-password-reset-token-repository'
import { LuciaSessionRepository } from '../infrastructure/session/lucia-session-repository'

function setupAuthService(dbConnection: IDrizzleConnection): AuthService {
  const accountRepo = new DrizzleAccountRepository(dbConnection)
  const sessionRepo = new LuciaSessionRepository(createLucia(dbConnection))
  const passwordResetTokenRepo = new DrizzlePasswordResetTokenRepository(dbConnection)
  const passwordHashRepo = new BcryptHashRepository()
  const passwordResetTokenHashRepo = new Sha256HashRepository()

  return new AuthService(
    accountRepo,
    sessionRepo,
    passwordResetTokenRepo,
    passwordHashRepo,
    passwordResetTokenHashRepo,
  )
}

describe('register', () => {
  test('should register a new user successfully', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)

    const result = await authService.register('newuser', 'password123')

    expect(result).toBeInstanceOf(Cookie)

    const createdUser = await dbConnection.query.accounts.findFirst({
      where: (accounts, { eq }) => eq(accounts.username, 'newuser'),
    })

    expect(createdUser).toBeDefined()
    expect(createdUser?.username).toBe('newuser')
  })

  test('should not register a user with an existing username', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)

    // First, register a user
    await authService.register('existinguser', 'password123')

    // Try to register again with the same username
    const result = await authService.register('existinguser', 'anotherpassword')

    expect(result).toBeInstanceOf(NonUniqueUsernameError)
  })

  test('should hash the password before storing', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)

    await authService.register('hashtest', 'password123')

    const createdUser = await dbConnection.query.accounts.findFirst({
      where: (accounts, { eq }) => eq(accounts.username, 'hashtest'),
    })

    expect(createdUser).toBeDefined()
    expect(createdUser?.password).toBeTypeOf('string')
    expect(createdUser?.password).not.toBe('password123') // should be hashed
  })

  test('should create a session for the new user', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)

    await authService.register('sessionuser', 'password123')

    const createdAccount = await dbConnection.query.accounts.findFirst({
      where: (accounts, { eq }) => eq(accounts.username, 'sessionuser'),
    })
    if (!createdAccount) {
      expect.fail('Account not found')
    }

    const createdSession = await dbConnection.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.userId, createdAccount.id),
    })

    expect(createdSession).toBeDefined()
  })
})

describe('login', () => {
  test('should login a user successfully', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)

    // First, register a user
    await authService.register('testuser', 'password123')

    // Now, try to log in
    const result = await authService.login('testuser', 'password123')

    expect(result).toBeInstanceOf(Cookie)
  })

  test('should return InvalidLoginError for incorrect password', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)

    // First, register a user
    await authService.register('testuser', 'password123')

    // Now, try to log in with incorrect password
    const result = await authService.login('testuser', 'wrongpassword')

    expect(result).toBeInstanceOf(InvalidLoginError)
  })

  test('should return InvalidLoginError for non-existent user', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)

    // Try to log in with a non-existent user
    const result = await authService.login('nonexistentuser', 'password123')

    expect(result).toBeInstanceOf(InvalidLoginError)
  })

  test('should create a new session on successful login', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)

    // First, register a user
    await authService.register('sessionuser', 'password123')

    // Now, log in
    await authService.login('sessionuser', 'password123')

    const createdAccount = await dbConnection.query.accounts.findFirst({
      where: (accounts, { eq }) => eq(accounts.username, 'sessionuser'),
    })
    if (!createdAccount) {
      expect.fail('Account not found')
    }

    const createdSession = await dbConnection.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.userId, createdAccount.id),
    })

    expect(createdSession).toBeDefined()
  })
})

describe('logout', () => {
  test('should logout a user successfully', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)

    // First, register and login a user
    await authService.register('testuser', 'password123')
    const loginResult = await authService.login('testuser', 'password123')

    if (!(loginResult instanceof Cookie)) {
      expect.fail('Login failed')
    }

    // Extract session ID from the cookie
    const sessionId = loginResult.value

    // Now, try to log out
    const logoutResult = await authService.logout(sessionId)

    expect(logoutResult).toBeInstanceOf(Cookie)
    expect(logoutResult.value).toBe('') // Expect an empty cookie value for logout
  })

  test('should delete the session on logout', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)

    // First, register and login a user
    await authService.register('sessionuser', 'password123')
    const loginResult = await authService.login('sessionuser', 'password123')

    if (!(loginResult instanceof Cookie)) {
      expect.fail('Login failed')
    }

    // Extract session ID from the cookie
    const sessionId = loginResult.value

    // Log out
    await authService.logout(sessionId)

    // Check if the session was deleted
    const session = await dbConnection.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.id, sessionId),
    })

    expect(session).toBeUndefined()
  })

  test('should not throw error when logging out with invalid session ID', async ({
    dbConnection,
  }) => {
    const authService = setupAuthService(dbConnection)

    // Try to log out with an invalid session ID
    const result = await authService.logout('invalid_session_id')

    expect(result).toBeInstanceOf(Cookie)
    expect(result.value).toBe('') // Expect an empty cookie value
  })
})

describe('checkPasswordResetToken', () => {
  test('should return valid PasswordResetToken for a valid token', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)
    const accountRepo = new DrizzleAccountRepository(dbConnection)
    const sha256HashRepo = new Sha256HashRepository()

    // Create a user
    await authService.register('testuser', 'password123')
    const user = await accountRepo.findByUsername('testuser')
    if (!user) {
      expect.fail('User not found')
    }

    // Create a password reset token
    const token = 'valid_token'
    const tokenHash = await sha256HashRepo.hash(token)
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now
    await dbConnection.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    })

    // Check the token
    const result = await authService.checkPasswordResetToken(token)

    expect(result).toBeInstanceOf(PasswordResetToken)
    expect((result as PasswordResetToken).accountId).toBe(user.id)
    expect((result as PasswordResetToken).tokenHash).toBe(tokenHash)
    expect((result as PasswordResetToken).expiresAt).toEqual(expiresAt)
  })

  test('should return PasswordResetTokenNotFoundError for a non-existent token', async ({
    dbConnection,
  }) => {
    const authService = setupAuthService(dbConnection)

    const result = await authService.checkPasswordResetToken('non_existent_token')

    expect(result).toBeInstanceOf(PasswordResetTokenNotFoundError)
  })

  test('should return ExpiredPasswordResetTokenError for an expired token', async ({
    dbConnection,
  }) => {
    const authService = setupAuthService(dbConnection)
    const accountRepo = new DrizzleAccountRepository(dbConnection)
    const sha256HashRepo = new Sha256HashRepository()

    // Create a user
    await authService.register('testuser', 'password123')
    const user = await accountRepo.findByUsername('testuser')
    if (!user) {
      expect.fail('User not found')
    }

    // Create an expired password reset token
    const token = 'expired_token'
    const tokenHash = await sha256HashRepo.hash(token)
    const expiresAt = new Date(Date.now() - 1000) // 1 second ago
    await dbConnection.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    })

    // Check the token
    const result = await authService.checkPasswordResetToken(token)

    expect(result).toBeInstanceOf(ExpiredPasswordResetTokenError)
  })
})
