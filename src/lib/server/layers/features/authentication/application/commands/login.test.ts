import { describe, expect } from 'vitest'

import { createLucia } from '$lib/server/auth'
import type { IDrizzleConnection } from '$lib/server/db/connection'

import { test } from '../../../../../../../vitest-setup'
import { NewAccount } from '../../domain/entities/account'
import { Cookie } from '../../domain/entities/cookie'
import { DrizzleAccountRepository } from '../../infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '../../infrastructure/hash/bcrypt-hash-repository'
import { LuciaSessionRepository } from '../../infrastructure/session/lucia-session-repository'
import { InvalidLoginError } from '../errors/invalid-login'
import { LoginCommand } from './login'

async function setupCommand(options: {
  dbConnection: IDrizzleConnection
  existingAccount?: { username: string; password: string }
}) {
  const accountRepo = new DrizzleAccountRepository(options.dbConnection)
  const sessionRepo = new LuciaSessionRepository(createLucia(options.dbConnection))
  const passwordHashRepo = new BcryptHashRepository()

  if (options.existingAccount) {
    await accountRepo.create(
      new NewAccount({
        username: options.existingAccount.username,
        passwordHash: await passwordHashRepo.hash(options.existingAccount.password),
      }),
    )
  }

  const login = new LoginCommand(accountRepo, sessionRepo, passwordHashRepo)

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

    expect(result).toBeInstanceOf(Cookie)
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

    await login.execute('testaccount', 'password123')

    const sessions = await getAccountSessions('testaccount')
    expect(sessions).toHaveLength(1)
  })
})
