import { describe, expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'

import { test } from '../../../../../../../vitest-setup'
import { Sha256HashRepository } from '../../../../common/infrastructure/repositories/hash/sha256-hash-repository'
import { CryptoTokenGenerator } from '../../../../common/infrastructure/token/crypto-token-generator'
import { NewAccount } from '../../domain/entities/account'
import { PasswordResetToken } from '../../domain/entities/password-reset-token'
import { NonUniqueUsernameError } from '../../domain/errors/non-unique-username'
import { DrizzleAccountRepository } from '../../infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '../../infrastructure/hash/bcrypt-hash-repository'
import { DrizzlePasswordResetTokenRepository } from '../../infrastructure/password-reset-token/drizzle-password-reset-token-repository'
import { RequestPasswordResetCommand } from './request-password-reset'

function setup(dbConnection: IDrizzleConnection) {
  const passwordResetTokenRepo = new DrizzlePasswordResetTokenRepository(dbConnection)
  const passwordResetTokenGeneratorRepo = new CryptoTokenGenerator()
  const passwordResetTokenHashRepo = new Sha256HashRepository()

  const requestPasswordReset = new RequestPasswordResetCommand(
    passwordResetTokenRepo,
    passwordResetTokenGeneratorRepo,
    passwordResetTokenHashRepo,
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
  }
}

describe('RequestPasswordResetCommand', () => {
  test('should delete existing tokens and create a new one', async ({ dbConnection }) => {
    const { requestPasswordReset, createAccount, createPasswordResetToken, getPasswordResetToken } =
      setup(dbConnection)
    const account = await createAccount({ username: 'test', password: 'password' })

    // Create an existing token
    const existingToken = await createPasswordResetToken(account.id)

    const newRawToken = await requestPasswordReset.execute(account.id)

    // Check that the old token was deleted
    expect(await getPasswordResetToken(existingToken.tokenHash)).toBeUndefined()

    // Check that a new token was created
    const newToken = await getPasswordResetToken(await new Sha256HashRepository().hash(newRawToken))
    expect(newToken).toBeDefined()
    expect(newToken?.accountId).toBe(account.id)
  })

  test('should create a token that expires in 2 hours', async ({ dbConnection }) => {
    const { requestPasswordReset, createAccount } = setup(dbConnection)
    const account = await createAccount({ username: 'test', password: 'password' })

    const token = await requestPasswordReset.execute(account.id)

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
    const account = await createAccount({ username: 'test', password: 'password' })

    const token = await requestPasswordReset.execute(account.id)

    expect(token.length).toBe(40) // The CryptoTokenGenerator is set to generate 40-character tokens
  })
})
