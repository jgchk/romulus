import { describe, expect } from 'vitest'

import { NewAccount } from '../../domain/entities/account'
import { PasswordResetToken } from '../../domain/entities/password-reset-token'
import { NonUniqueUsernameError } from '../../domain/errors/non-unique-username'
import { UnauthorizedError } from '../../domain/errors/unauthorized'
import { BcryptHashRepository } from '../../infrastructure/bcrypt-hash-repository'
import { CryptoTokenGenerator } from '../../infrastructure/crypto-token-generator'
import { DrizzleAccountRepository } from '../../infrastructure/drizzle-account-repository'
import type { IDrizzleConnection } from '../../infrastructure/drizzle-database'
import { DrizzlePasswordResetTokenRepository } from '../../infrastructure/drizzle-password-reset-token-repository'
import { Sha256HashRepository } from '../../infrastructure/sha256-hash-repository'
import { MockAuthorizationService } from '../../test/mock-authorization-service'
import { test } from '../../vitest-setup'
import { RequestPasswordResetCommand } from './request-password-reset'

function setup(dbConnection: IDrizzleConnection) {
  const passwordResetTokenRepo = new DrizzlePasswordResetTokenRepository(dbConnection)
  const passwordResetTokenGeneratorRepo = new CryptoTokenGenerator()
  const passwordResetTokenHashRepo = new Sha256HashRepository()
  const accountRepo = new DrizzleAccountRepository(dbConnection)
  const authorization = new MockAuthorizationService()

  const requestPasswordReset = new RequestPasswordResetCommand(
    passwordResetTokenRepo,
    passwordResetTokenGeneratorRepo,
    passwordResetTokenHashRepo,
    accountRepo,
    authorization,
  )

  async function createAccount(data: { username: string; password: string }) {
    const accountRepo = new DrizzleAccountRepository(dbConnection)
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

  async function createPasswordResetToken(accountId: number) {
    const existingToken = new PasswordResetToken(accountId, 'existing_hash', new Date())
    await passwordResetTokenRepo.create(existingToken)
    return existingToken
  }

  async function getPasswordResetToken(tokenHash: string) {
    return passwordResetTokenRepo.findByTokenHash(tokenHash)
  }

  return {
    requestPasswordReset,
    createAccount,
    createPasswordResetToken,
    getPasswordResetToken,
    authorization,
  }
}

describe('RequestPasswordResetCommand', () => {
  test('should delete existing tokens and create a new one', async ({ dbConnection }) => {
    const { requestPasswordReset, createAccount, createPasswordResetToken, getPasswordResetToken } =
      setup(dbConnection)
    const account = await createAccount({ username: 'test', password: 'password' })

    // Create an existing token
    const existingToken = await createPasswordResetToken(account.id)

    const newRawToken = await requestPasswordReset.execute(1, 1)
    if (newRawToken instanceof Error) {
      expect.fail(`Failed to request password reset: ${newRawToken.message}`)
    }

    // Check that the old token was deleted
    expect(await getPasswordResetToken(existingToken.tokenHash)).toBeUndefined()

    // Check that a new token was created
    const newToken = await getPasswordResetToken(await new Sha256HashRepository().hash(newRawToken))
    expect(newToken).toBeDefined()
    expect(newToken?.accountId).toBe(account.id)
  })

  test('should create a token that expires in 2 hours', async ({ dbConnection }) => {
    const { requestPasswordReset, createAccount } = setup(dbConnection)
    await createAccount({ username: 'test', password: 'password' })

    const token = await requestPasswordReset.execute(1, 1)
    if (token instanceof Error) {
      expect.fail(`Failed to request password reset: ${token.message}`)
    }

    const hashedToken = await new Sha256HashRepository().hash(token)
    const createdToken = await new DrizzlePasswordResetTokenRepository(
      dbConnection,
    ).findByTokenHash(hashedToken)

    const now = new Date()
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    expect(createdToken?.expiresAt.getTime()).toBeGreaterThan(now.getTime())
    expect(createdToken?.expiresAt.getTime()).toBeLessThanOrEqual(twoHoursLater.getTime())
  })

  test('should generate a token of correct length', async ({ dbConnection }) => {
    const { requestPasswordReset, createAccount } = setup(dbConnection)
    await createAccount({ username: 'test', password: 'password' })

    const token = await requestPasswordReset.execute(1, 1)
    if (token instanceof Error) {
      expect.fail(`Failed to request password reset: ${token.message}`)
    }

    expect(token.length).toBe(40) // The CryptoTokenGenerator is set to generate 40-character tokens
  })

  test('should error if the requestor does not have the required permission', async ({
    dbConnection,
  }) => {
    const { requestPasswordReset, createAccount, authorization } = setup(dbConnection)
    await createAccount({ username: 'test', password: 'password' })
    authorization.hasPermission.mockResolvedValue(false)

    const result = await requestPasswordReset.execute(1, 1)

    expect(result).toEqual(new UnauthorizedError())
  })
})
