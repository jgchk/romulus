import { describe, expect } from 'vitest'

import { createLucia } from '$lib/server/auth'
import type { IDrizzleConnection } from '$lib/server/db/connection'

import { test } from '../../../../../../vitest-setup'
import { AuthService, InvalidLoginError } from '../application/auth-service'
import { Cookie } from '../domain/cookie'
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
