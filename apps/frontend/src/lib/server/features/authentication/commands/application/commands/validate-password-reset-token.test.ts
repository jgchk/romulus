import { describe, expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'

import { test } from '../../../../../../../vitest-setup'
import { Sha256HashRepository } from '../../../../common/infrastructure/repositories/hash/sha256-hash-repository'
import { NewAccount } from '../../domain/entities/account'
import { PasswordResetToken } from '../../domain/entities/password-reset-token'
import { NonUniqueUsernameError } from '../../domain/errors/non-unique-username'
import { DrizzleAccountRepository } from '../../infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '../../infrastructure/hash/bcrypt-hash-repository'
import { DrizzlePasswordResetTokenRepository } from '../../infrastructure/password-reset-token/drizzle-password-reset-token-repository'
import { PasswordResetTokenExpiredError } from '../errors/password-reset-token-expired'
import { PasswordResetTokenNotFoundError } from '../errors/password-reset-token-not-found'
import { ValidatePasswordResetTokenCommand } from './validate-password-reset-token'

function setupCommand(options: { dbConnection: IDrizzleConnection }) {
  const passwordResetTokenRepo = new DrizzlePasswordResetTokenRepository(options.dbConnection)
  const passwordResetTokenHashRepo = new Sha256HashRepository()

  const validatePasswordResetToken = new ValidatePasswordResetTokenCommand(
    passwordResetTokenRepo,
    passwordResetTokenHashRepo,
  )

  async function createAccount(data: { username: string; password: string }) {
    const accountRepo = new DrizzleAccountRepository(options.dbConnection)
    const passwordHashRepo = new BcryptHashRepository()

    const account = await accountRepo.create(
      new NewAccount({
        username: data.username,
        passwordHash: await passwordHashRepo.hash(data.password),
      }),
    )

    if (account instanceof NonUniqueUsernameError) {
      expect.fail('Account creation failed due to non-unique username')
    }

    return account
  }

  async function createPasswordResetToken(accountId: number, expiresAt?: Date) {
    const passwordResetTokenHashRepo = new Sha256HashRepository()

    const unhashedToken = 'valid_token'
    const tokenHash = await passwordResetTokenHashRepo.hash(unhashedToken)

    const passwordResetToken = new PasswordResetToken(
      accountId,
      tokenHash,
      expiresAt ?? new Date(Date.now() + 3600000), // 1 hour from now
    )

    await passwordResetTokenRepo.create(passwordResetToken)

    return { unhashedToken, passwordResetToken }
  }

  return { validatePasswordResetToken, createAccount, createPasswordResetToken }
}

describe('checkPasswordResetToken', () => {
  test('should return valid PasswordResetToken for a valid token', async ({ dbConnection }) => {
    const { validatePasswordResetToken, createAccount, createPasswordResetToken } = setupCommand({
      dbConnection,
    })

    const account = await createAccount({ username: 'testuser', password: 'password123' })
    const { unhashedToken, passwordResetToken } = await createPasswordResetToken(account.id)

    const result = await validatePasswordResetToken.execute(unhashedToken)

    expect(result).toBeInstanceOf(PasswordResetToken)
    expect((result as PasswordResetToken).accountId).toBe(passwordResetToken.accountId)
    expect((result as PasswordResetToken).tokenHash).toBe(passwordResetToken.tokenHash)
    expect((result as PasswordResetToken).expiresAt).toEqual(passwordResetToken.expiresAt)
  })

  test('should return PasswordResetTokenNotFoundError for a non-existent token', async ({
    dbConnection,
  }) => {
    const { validatePasswordResetToken } = setupCommand({ dbConnection })

    const result = await validatePasswordResetToken.execute('non_existent_token')

    expect(result).toBeInstanceOf(PasswordResetTokenNotFoundError)
  })

  test('should return ExpiredPasswordResetTokenError for an expired token', async ({
    dbConnection,
  }) => {
    const { validatePasswordResetToken, createAccount, createPasswordResetToken } = setupCommand({
      dbConnection,
    })

    const account = await createAccount({ username: 'testuser', password: 'password123' })
    const { unhashedToken } = await createPasswordResetToken(
      account.id,
      new Date(Date.now() - 1000), // Expired 1 second ago
    )

    // Check the token
    const result = await validatePasswordResetToken.execute(unhashedToken)

    expect(result).toBeInstanceOf(PasswordResetTokenExpiredError)
  })
})
