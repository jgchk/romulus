import { describe, expect } from 'vitest'

import { NewAccount } from '../../domain/entities/account.js'
import { Session } from '../../domain/entities/session.js'
import { NonUniqueUsernameError } from '../../domain/errors/non-unique-username.js'
import { UnauthorizedError } from '../../domain/errors/unauthorized.js'
import { BcryptHashRepository } from '../../infrastructure/bcrypt-hash-repository.js'
import { CryptoTokenGenerator } from '../../infrastructure/crypto-token-generator.js'
import { DrizzleAccountRepository } from '../../infrastructure/drizzle-account-repository.js'
import type { IDrizzleConnection } from '../../infrastructure/drizzle-database.js'
import { DrizzleSessionRepository } from '../../infrastructure/drizzle-session-repository.js'
import { Sha256HashRepository } from '../../infrastructure/sha256-hash-repository.js'
import { test } from '../../vitest-setup.js'
import { RefreshSessionCommand } from './refresh-session.js'

function setupCommand(options: { dbConnection: IDrizzleConnection }) {
  const sessionRepo = new DrizzleSessionRepository(options.dbConnection)
  const sessionTokenHashRepo = new Sha256HashRepository()
  const sessionTokenGenerator = new CryptoTokenGenerator()

  const refreshSession = new RefreshSessionCommand(sessionRepo, sessionTokenHashRepo)

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

  async function createSession(accountId: number) {
    const token = sessionTokenGenerator.generate(20)

    const tokenHash = await sessionTokenHashRepo.hash(token)

    const session = new Session(
      accountId,
      tokenHash,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    )
    await sessionRepo.save(session)
    return { ...session, token }
  }

  return { refreshSession, createAccount, createSession }
}

describe('refreshSession', () => {
  test('should error when session is not found', async ({ dbConnection }) => {
    const { refreshSession } = setupCommand({ dbConnection })

    const result = await refreshSession.execute('non_existent_session_id')

    expect(result).toEqual(new UnauthorizedError())
  })

  test('should return new token and expiry when session is refreshed', async ({ dbConnection }) => {
    const { refreshSession, createAccount, createSession } = setupCommand({ dbConnection })

    const account = await createAccount({ username: 'testuser-refresh', password: 'password123' })
    const session = await createSession(account.id)

    const result = await refreshSession.execute(session.token)

    expect(result).toEqual({
      token: expect.any(String) as string,
      expiresAt: expect.any(Date) as Date,
    })
  })

  test('should error when session is expired', async ({ dbConnection, withSystemTime }) => {
    const { refreshSession, createAccount, createSession } = setupCommand({ dbConnection })

    const account = await createAccount({ username: 'testuser-expiry', password: 'password123' })
    const session = await createSession(account.id)

    // 100 years in the future
    withSystemTime(new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100))

    const result = await refreshSession.execute(session.token)

    expect(result).toEqual(new UnauthorizedError())
  })
})
