import { describe, expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { Sha256HashRepository } from '$lib/server/features/common/infrastructure/repositories/hash/sha256-hash-repository'

import { test } from '../../../../../../../vitest-setup'
import { CryptoTokenGenerator } from '../../../../common/infrastructure/token/crypto-token-generator'
import { DrizzleAccountRepository } from '../../infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '../../infrastructure/hash/bcrypt-hash-repository'
import { DrizzleSessionRepository } from '../../infrastructure/session/drizzle-session-repository'
import { NonUniqueUsernameError } from '../errors/non-unique-username'
import { RegisterCommand } from './register'

function setupCommand(options: { dbConnection: IDrizzleConnection }) {
  const accountRepo = new DrizzleAccountRepository(options.dbConnection)
  const sessionRepo = new DrizzleSessionRepository(options.dbConnection, false, 'auth_session')
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
    await register.execute('existingaccount', 'password123')

    // Try to register again with the same username
    const result = await register.execute('existingaccount', 'anotherpassword')

    expect(result).toBeInstanceOf(NonUniqueUsernameError)
  })

  test('should hash the password before storing', async ({ dbConnection }) => {
    const { register, getAccount } = setupCommand({ dbConnection })

    await register.execute('hashtest', 'password123')

    const account = await getAccount('hashtest')
    expect(account).toBeDefined()
    expect(account?.passwordHash).toBeTypeOf('string')
    expect(account?.passwordHash).not.toBe('password123') // should be hashed
  })

  test('should create a session for the new account', async ({ dbConnection }) => {
    const { register, getAccountSessions } = setupCommand({ dbConnection })

    await register.execute('sessionaccount', 'password123')

    const sessions = await getAccountSessions('sessionaccount')
    expect(sessions).toHaveLength(1)
  })
})
