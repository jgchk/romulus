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
import { DrizzleSessionRepository } from '../../infrastructure/session/drizzle-session-repository'
import { AccountNotFoundError } from '../errors/account-not-found'
import { InvalidLoginError } from '../errors/invalid-login'
import { LoginCommand } from './login'
import { ResetPasswordCommand } from './reset-password'

function setupCommand(options: { dbConnection: IDrizzleConnection }) {
  const accountRepo = new DrizzleAccountRepository(options.dbConnection)
  const sessionRepo = new DrizzleSessionRepository(options.dbConnection)
  const passwordResetTokenRepo = new DrizzlePasswordResetTokenRepository(options.dbConnection)
  const passwordHashRepo = new BcryptHashRepository()
  const sessionTokenHashRepo = new Sha256HashRepository()
  const sessionTokenGenerator = new CryptoTokenGenerator()

  const resetPassword = new ResetPasswordCommand(
    accountRepo,
    sessionRepo,
    passwordResetTokenRepo,
    passwordHashRepo,
    sessionTokenHashRepo,
    sessionTokenGenerator,
  )

  async function createAccount(data: { username: string; password: string }) {
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

  async function loginAccount(data: { username: string; password: string }) {
    const login = new LoginCommand(
      accountRepo,
      sessionRepo,
      passwordHashRepo,
      sessionTokenHashRepo,
      sessionTokenGenerator,
    )
    const result = await login.execute(data.username, data.password)
    return result
  }

  async function getAccountSessions(username: string) {
    const account = await accountRepo.findByUsername(username)
    if (!account) return []

    const sessions = await sessionRepo.findByAccountId(account.id)
    return sessions
  }

  async function createPasswordResetToken(accountId: number) {
    const passwordResetTokenHashRepo = new Sha256HashRepository()

    const token = 'valid_token'
    const tokenHash = await passwordResetTokenHashRepo.hash(token)
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now

    const passwordResetToken = new PasswordResetToken(accountId, tokenHash, expiresAt)

    await passwordResetTokenRepo.create(passwordResetToken)

    return passwordResetToken
  }

  async function getPasswordResetToken(tokenHash: string) {
    return await passwordResetTokenRepo.findByTokenHash(tokenHash)
  }

  return {
    resetPassword,
    createAccount,
    loginAccount,
    getAccountSessions,
    createPasswordResetToken,
    getPasswordResetToken,
  }
}

describe('resetPassword', () => {
  test('should successfully reset password', async ({ dbConnection }) => {
    const { resetPassword, createAccount, createPasswordResetToken, loginAccount } = setupCommand({
      dbConnection,
    })
    const account = await createAccount({ username: 'testaccount', password: 'oldpassword' })
    const passwordResetToken = await createPasswordResetToken(account.id)

    const result = await resetPassword.execute(passwordResetToken, 'newpassword')

    expect(result).toEqual({
      userAccount: {
        id: expect.any(Number) as number,
      },
      userSession: {
        token: expect.any(String) as string,
        expiresAt: expect.any(Date) as Date,
      },
    })

    // Try to login with the new password
    const loginResult = await loginAccount({ username: 'testaccount', password: 'newpassword' })
    expect(loginResult).not.toBeInstanceOf(Error)

    // Try to login with the old password (should fail)
    const oldPasswordLoginResult = await loginAccount({
      username: 'testaccount',
      password: 'oldpassword',
    })
    expect(oldPasswordLoginResult).toBeInstanceOf(InvalidLoginError)
  })

  test('should return AccountNotFoundError for non-existent account', async ({ dbConnection }) => {
    const { resetPassword } = setupCommand({ dbConnection })
    const passwordResetToken = new PasswordResetToken(999, 'valid_token', new Date())

    const result = await resetPassword.execute(passwordResetToken, 'newpassword')

    expect(result).toBeInstanceOf(AccountNotFoundError)
  })

  test('should delete all current sessions for the account after password reset', async ({
    dbConnection,
  }) => {
    const {
      resetPassword,
      createAccount,
      createPasswordResetToken,
      loginAccount,
      getAccountSessions,
    } = setupCommand({
      dbConnection,
    })
    const account = await createAccount({ username: 'testaccount', password: 'oldpassword' })
    const passwordResetToken = await createPasswordResetToken(account.id)

    // Create multiple sessions for the account
    const session1 = await loginAccount({ username: 'testaccount', password: 'oldpassword' })
    if (session1 instanceof Error) {
      expect.fail(`Failed to create session: ${session1.message}`)
    }
    const session2 = await loginAccount({ username: 'testaccount', password: 'oldpassword' })
    if (session2 instanceof Error) {
      expect.fail(`Failed to create session: ${session2.message}`)
    }
    const preResetSessions = await getAccountSessions('testaccount')
    expect(preResetSessions).toHaveLength(2)

    // Reset the password
    const resetPasswordResult = await resetPassword.execute(passwordResetToken, 'newpassword')
    if (resetPasswordResult instanceof Error) {
      expect.fail(`Failed to reset password: ${resetPasswordResult.message}`)
    }

    // Check if all current sessions for the account were deleted (except for the new one)
    const postResetSessions = await getAccountSessions('testaccount')
    expect(postResetSessions).toHaveLength(1)
  })

  test('should delete the password reset token after successful reset', async ({
    dbConnection,
  }) => {
    const { resetPassword, createAccount, createPasswordResetToken, getPasswordResetToken } =
      setupCommand({
        dbConnection,
      })
    const account = await createAccount({ username: 'testaccount', password: 'oldpassword' })
    const passwordResetToken = await createPasswordResetToken(account.id)

    const resetPasswordResult = await resetPassword.execute(passwordResetToken, 'newpassword')
    if (resetPasswordResult instanceof Error) {
      expect.fail(`Failed to reset password: ${resetPasswordResult.message}`)
    }

    const storedToken = await getPasswordResetToken(passwordResetToken.tokenHash)
    expect(storedToken).toBeUndefined()
  })
})
