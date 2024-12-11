import { describe, expect } from 'vitest'

import { BcryptHashRepository } from '../../infrastructure/bcrypt-hash-repository'
import { CryptoTokenGenerator } from '../../infrastructure/crypto-token-generator'
import { DrizzleAccountRepository } from '../../infrastructure/drizzle-account-repository'
import type { IDrizzleConnection } from '../../infrastructure/drizzle-database'
import { DrizzleSessionRepository } from '../../infrastructure/drizzle-session-repository'
import { Sha256HashRepository } from '../../infrastructure/sha256-hash-repository'
import { test } from '../../vitest-setup'
import { NonUniqueUsernameError } from '../errors/non-unique-username'
import { RegisterCommand } from './register'

function setupCommand(options: { dbConnection: IDrizzleConnection }) {
  const accountRepo = new DrizzleAccountRepository(options.dbConnection)
  const sessionRepo = new DrizzleSessionRepository(options.dbConnection)
  const passwordHashRepo = new BcryptHashRepository()
  const sessionTokenHashRepo = new Sha256HashRepository()
  const sessionTokenGenerator = new CryptoTokenGenerator()

  const register = new RegisterCommand(
    accountRepo,
    sessionRepo,
    passwordHashRepo,
    sessionTokenHashRepo,
    sessionTokenGenerator,
  )

  async function getAccount(username: string) {
    const account = await accountRepo.findByUsername(username)
    return account
  }

  async function getAccountSessions(username: string) {
    const account = await accountRepo.findByUsername(username)
    if (!account) return []

    const sessions = await sessionRepo.findByAccountId(account.id)
    return sessions
  }

  return { register, getAccount, getAccountSessions }
}

describe('register', () => {
  test('should register a new account successfully', async ({ dbConnection }) => {
    const { register, getAccount } = setupCommand({ dbConnection })

    const result = await register.execute('newaccount', 'password123')

    expect(result).toEqual({
      newUserAccount: {
        id: expect.any(Number) as number,
      },
      newUserSession: {
        token: expect.any(String) as string,
        expiresAt: expect.any(Date) as Date,
      },
    })

    const account = await getAccount('newaccount')
    expect(account).toBeDefined()
    expect(account?.username).toBe('newaccount')
  })

  test('should not register an account with an existing username', async ({ dbConnection }) => {
    const { register } = setupCommand({ dbConnection })

    // First, register an account
    const firstRegisterResult = await register.execute('existingaccount', 'password123')
    if (firstRegisterResult instanceof Error) {
      expect.fail(`First registration failed: ${firstRegisterResult.message}`)
    }

    // Try to register again with the same username
    const secondRegisterResult = await register.execute('existingaccount', 'anotherpassword')

    expect(secondRegisterResult).toBeInstanceOf(NonUniqueUsernameError)
  })

  test('should hash the password before storing', async ({ dbConnection }) => {
    const { register, getAccount } = setupCommand({ dbConnection })

    const result = await register.execute('hashtest', 'password123')
    if (result instanceof Error) {
      expect.fail(`Registration failed: ${result.message}`)
    }

    const account = await getAccount('hashtest')
    expect(account).toBeDefined()
    expect(account?.passwordHash).toBeTypeOf('string')
    expect(account?.passwordHash).not.toBe('password123') // should be hashed
  })

  test('should create a session for the new account', async ({ dbConnection }) => {
    const { register, getAccountSessions } = setupCommand({ dbConnection })

    const result = await register.execute('sessionaccount', 'password123')
    if (result instanceof Error) {
      expect.fail(`Registration failed: ${result.message}`)
    }

    const sessions = await getAccountSessions('sessionaccount')
    expect(sessions).toHaveLength(1)
  })
})
