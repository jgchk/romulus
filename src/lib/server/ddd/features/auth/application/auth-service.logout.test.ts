import { describe, expect } from 'vitest'

import { createLucia } from '$lib/server/auth'
import type { IDrizzleConnection } from '$lib/server/db/connection'

import { test } from '../../../../../../vitest-setup'
import { AuthService } from '../application/auth-service'
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
