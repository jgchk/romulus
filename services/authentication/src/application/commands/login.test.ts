import { describe, expect } from 'vitest'

import { NewAccount } from '../../domain/entities/account'
import { BcryptHashRepository } from '../../infrastructure/bcrypt-hash-repository'
import { CryptoTokenGenerator } from '../../infrastructure/crypto-token-generator'
import { DrizzleAccountRepository } from '../../infrastructure/drizzle-account-repository'
import type { IDrizzleConnection } from '../../infrastructure/drizzle-database'
import { DrizzleSessionRepository } from '../../infrastructure/drizzle-session-repository'
import { Sha256HashRepository } from '../../infrastructure/sha256-hash-repository'
import { test } from '../../vitest-setup'
import { InvalidLoginError } from '../errors/invalid-login'
import { LoginCommand } from './login'

async function setupCommand(options: {
  dbConnection: IDrizzleConnection
  existingAccount?: { username: string; password: string }
}) {
  const accountRepo = new DrizzleAccountRepository(options.dbConnection)
  const sessionRepo = new DrizzleSessionRepository(options.dbConnection)
  const passwordHashRepo = new BcryptHashRepository()
  const sessionTokenHashRepo = new Sha256HashRepository()
  const sessionTokenGenerator = new CryptoTokenGenerator()

  if (options.existingAccount) {
    const account = await accountRepo.create(
      new NewAccount({
        username: options.existingAccount.username,
        passwordHash: await passwordHashRepo.hash(options.existingAccount.password),
      }),
    )
    if (account instanceof Error) {
      expect.fail(`Failed to create account: ${account.message}`)
    }
  }

  const login = new LoginCommand(
    accountRepo,
    sessionRepo,
    passwordHashRepo,
    sessionTokenHashRepo,
    sessionTokenGenerator,
  )

  async function getAccountSessions(username: string) {
    const account = await accountRepo.findByUsername(username)
    if (!account) return []

    const sessions = await sessionRepo.findByAccountId(account.id)
    return sessions
  }

  return { login, getAccountSessions }
}

describe('login', () => {
  test('should login an account successfully', async ({ dbConnection }) => {
    const { login } = await setupCommand({
      dbConnection,
      existingAccount: { username: 'testaccount', password: 'password123' },
    })

    const result = await login.execute('testaccount', 'password123')

    expect(result).toEqual({
      userAccount: {
        id: expect.any(Number) as number,
      },
      userSession: {
        token: expect.any(String) as string,
        expiresAt: expect.any(Date) as Date,
      },
    })
  })

  test('should return InvalidLoginError for incorrect password', async ({ dbConnection }) => {
    const { login } = await setupCommand({
      dbConnection,
      existingAccount: { username: 'testaccount', password: 'password123' },
    })

    const result = await login.execute('testaccount', 'wrongpassword')

    expect(result).toBeInstanceOf(InvalidLoginError)
  })

  test('should return InvalidLoginError for non-existent account', async ({ dbConnection }) => {
    const { login } = await setupCommand({ dbConnection })

    const result = await login.execute('nonexistentaccount', 'password123')

    expect(result).toBeInstanceOf(InvalidLoginError)
  })

  test('should create a new session on successful login', async ({ dbConnection }) => {
    const { login, getAccountSessions } = await setupCommand({
      dbConnection,
      existingAccount: { username: 'testaccount', password: 'password123' },
    })

    const loginResult = await login.execute('testaccount', 'password123')
    if (loginResult instanceof Error) {
      expect.fail(`Failed to login: ${loginResult.message}`)
    }

    const sessions = await getAccountSessions('testaccount')
    expect(sessions).toHaveLength(1)
  })
})
