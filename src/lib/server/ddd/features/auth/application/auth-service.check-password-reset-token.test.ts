import { describe, expect } from 'vitest'

import { createLucia } from '$lib/server/auth'
import type { IDrizzleConnection } from '$lib/server/db/connection'
import { passwordResetTokens } from '$lib/server/db/schema'

import { test } from '../../../../../../vitest-setup'
import {
  AuthService,
  ExpiredPasswordResetTokenError,
  PasswordResetTokenNotFoundError,
} from '../application/auth-service'
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
