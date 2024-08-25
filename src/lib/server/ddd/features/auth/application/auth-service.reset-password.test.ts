import { describe, expect } from 'vitest'

import { createLucia } from '$lib/server/auth'
import type { IDrizzleConnection } from '$lib/server/db/connection'
import { passwordResetTokens } from '$lib/server/db/schema'

import { test } from '../../../../../../vitest-setup'
import { AccountNotFoundError, AuthService, InvalidLoginError } from '../application/auth-service'
import { Cookie } from '../domain/cookie'
import { PasswordResetToken } from '../domain/password-reset-token'
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

describe('resetPassword', () => {
  test('should successfully reset password', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)
    const accountRepo = new DrizzleAccountRepository(dbConnection)
    const sha256HashRepo = new Sha256HashRepository()

    // Create a user
    await authService.register('testuser', 'oldpassword')
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

    // Reset the password
    const passwordResetToken = new PasswordResetToken(user.id, tokenHash, expiresAt)
    const result = await authService.resetPassword(passwordResetToken, 'newpassword')

    expect(result).toBeInstanceOf(Cookie)

    // Try to login with the new password
    const loginResult = await authService.login('testuser', 'newpassword')
    expect(loginResult).toBeInstanceOf(Cookie)

    // Try to login with the old password (should fail)
    const oldPasswordLoginResult = await authService.login('testuser', 'oldpassword')
    expect(oldPasswordLoginResult).toBeInstanceOf(InvalidLoginError)
  })

  test('should return AccountNotFoundError for non-existent account', async ({ dbConnection }) => {
    const authService = setupAuthService(dbConnection)
    const sha256HashRepo = new Sha256HashRepository()

    const tokenHash = await sha256HashRepo.hash('some_token')
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now
    const passwordResetToken = new PasswordResetToken(999999, tokenHash, expiresAt) // Use a non-existent account ID

    const result = await authService.resetPassword(passwordResetToken, 'newpassword')

    expect(result).toBeInstanceOf(AccountNotFoundError)
  })

  test('should delete all current sessions for the account after password reset', async ({
    dbConnection,
  }) => {
    const authService = setupAuthService(dbConnection)
    const accountRepo = new DrizzleAccountRepository(dbConnection)
    const sha256HashRepo = new Sha256HashRepository()

    // Create a user
    await authService.register('testuser', 'oldpassword')
    const user = await accountRepo.findByUsername('testuser')
    if (!user) {
      expect.fail('User not found')
    }

    // Create multiple sessions for the user
    await authService.login('testuser', 'oldpassword')
    await authService.login('testuser', 'oldpassword')
    const preResetSessions = await dbConnection.query.sessions.findMany({
      where: (sessions, { eq }) => eq(sessions.userId, user.id),
    })
    expect(preResetSessions).toHaveLength(3)

    // Create a password reset token
    const token = 'valid_token'
    const tokenHash = await sha256HashRepo.hash(token)
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now
    await dbConnection.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    })

    // Reset the password
    const passwordResetToken = new PasswordResetToken(user.id, tokenHash, expiresAt)
    await authService.resetPassword(passwordResetToken, 'newpassword')

    // Check if all current sessions for the user were deleted (except for the new one)
    const postResetSessions = await dbConnection.query.sessions.findMany({
      where: (sessions, { eq }) => eq(sessions.userId, user.id),
    })
    expect(postResetSessions).toHaveLength(1)
  })

  test('should delete the password reset token after successful reset', async ({
    dbConnection,
  }) => {
    const authService = setupAuthService(dbConnection)
    const accountRepo = new DrizzleAccountRepository(dbConnection)
    const passwordResetTokenRepo = new DrizzlePasswordResetTokenRepository(dbConnection)
    const sha256HashRepo = new Sha256HashRepository()

    // Create a user
    await authService.register('testuser', 'oldpassword')
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

    // Reset the password
    const passwordResetToken = new PasswordResetToken(user.id, tokenHash, expiresAt)
    await authService.resetPassword(passwordResetToken, 'newpassword')

    // Check if the token was deleted
    const storedToken = await passwordResetTokenRepo.findByTokenHash(tokenHash)
    expect(storedToken).toBeUndefined()
  })
})
