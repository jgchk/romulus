import { describe, expect } from 'vitest'

import { NewAccount } from '../../domain/entities/account'
import { Session } from '../../domain/entities/session'
import { NonUniqueUsernameError } from '../../domain/errors/non-unique-username'
import { BcryptHashRepository } from '../../infrastructure/bcrypt-hash-repository'
import { CryptoTokenGenerator } from '../../infrastructure/crypto-token-generator'
import { DrizzleAccountRepository } from '../../infrastructure/drizzle-account-repository'
import type { IDrizzleConnection } from '../../infrastructure/drizzle-database'
import { DrizzleSessionRepository } from '../../infrastructure/drizzle-session-repository'
import { Sha256HashRepository } from '../../infrastructure/sha256-hash-repository'
import { test } from '../../vitest-setup'
import { GetSessionCommand } from './get-session'

function setupCommand(options: { dbConnection: IDrizzleConnection }) {
  const accountRepo = new DrizzleAccountRepository(options.dbConnection)
  const sessionRepo = new DrizzleSessionRepository(options.dbConnection)
  const sessionTokenHashRepo = new Sha256HashRepository()
  const sessionTokenGenerator = new CryptoTokenGenerator()

  const getSession = new GetSessionCommand(accountRepo, sessionRepo, sessionTokenHashRepo)

  async function createAccount(data: { username: string; password: string }) {
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

  return { validateSession: getSession, createAccount, createSession }
}

describe('getSession', () => {
  test('should return undefined account and session when session is not found', async ({
    dbConnection,
  }) => {
    const { validateSession } = setupCommand({ dbConnection })

    const result = await validateSession.execute('non_existent_session_id')

    expect(result).toEqual({
      userAccount: undefined,
      userSession: undefined,
    })
  })

  test('should return account and session when session is valid', async ({ dbConnection }) => {
    const { validateSession, createAccount, createSession } = setupCommand({ dbConnection })

    const account = await createAccount({ username: 'testuser', password: 'password123' })
    const session = await createSession(account.id)

    const result = await validateSession.execute(session.token)

    expect(result).toEqual({
      account: {
        id: account.id,
        username: 'testuser',
        genreRelevanceFilter: 0,
        showRelevanceTags: false,
        showTypeTags: true,
        showNsfw: false,
        darkMode: true,
      },
      session: {
        expiresAt: session.expiresAt,
      },
    })
  })

  test('should return undefined when session is expired', async ({
    dbConnection,
    withSystemTime,
  }) => {
    const { validateSession, createAccount, createSession } = setupCommand({ dbConnection })

    const account = await createAccount({ username: 'testuser', password: 'password123' })
    const session = await createSession(account.id)

    // 10 years in the future
    withSystemTime(new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000))

    const result = await validateSession.execute(session.token)

    expect(result).toEqual({
      account: undefined,
      session: undefined,
    })
  })
})
