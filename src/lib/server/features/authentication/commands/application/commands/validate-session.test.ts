import { describe, expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { Sha256HashRepository } from '$lib/server/features/common/infrastructure/repositories/hash/sha256-hash-repository'

import { test } from '../../../../../../../vitest-setup'
import { NewAccount } from '../../domain/entities/account'
import { Cookie } from '../../domain/entities/cookie'
import { Session } from '../../domain/entities/session'
import { InvalidTokenLengthError } from '../../domain/errors/invalid-token-length'
import { NonUniqueUsernameError } from '../../domain/errors/non-unique-username'
import { DrizzleAccountRepository } from '../../infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '../../infrastructure/hash/bcrypt-hash-repository'
import { DrizzleSessionRepository } from '../../infrastructure/session/drizzle-session-repository'
import { CryptoTokenGenerator } from '../../infrastructure/token/crypto-token-generator'
import { ValidateSessionCommand } from './validate-session'

function setupCommand(options: { dbConnection: IDrizzleConnection }) {
  const accountRepo = new DrizzleAccountRepository(options.dbConnection)
  const sessionRepo = new DrizzleSessionRepository(options.dbConnection, false, 'auth_session')
  const sessionTokenHashRepo = new Sha256HashRepository()
  const sessionTokenGenerator = new CryptoTokenGenerator()

  const validateSession = new ValidateSessionCommand(accountRepo, sessionRepo, sessionTokenHashRepo)

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
    if (token instanceof InvalidTokenLengthError) {
      expect.fail('Token generation failed')
    }

    const tokenHash = await sessionTokenHashRepo.hash(token)

    const session = new Session(
      accountId,
      tokenHash,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    )
    await sessionRepo.save(session)
    return { ...session, token }
  }

  return { validateSession, createAccount, createSession }
}

describe('validateSession', () => {
  test('should return undefined values when sessionToken is undefined', async ({
    dbConnection,
  }) => {
    const { validateSession } = setupCommand({ dbConnection })

    const result = await validateSession.execute(undefined)

    expect(result.account).toBeUndefined()
    expect(result.session).toBeUndefined()
    expect(result.cookie).toBeUndefined()
  })

  test('should return cookie to clear session when session is not found', async ({
    dbConnection,
  }) => {
    const { validateSession } = setupCommand({ dbConnection })

    const result = await validateSession.execute('non_existent_session_id')

    expect(result.account).toBeUndefined()
    expect(result.session).toBeUndefined()
    expect(result.cookie).toBeInstanceOf(Cookie)
    expect(result.cookie?.value).toBe('')
  })

  test('should return account, session, and new cookie when session is valid and just extended', async ({
    dbConnection,
    withSystemTime,
  }) => {
    const { validateSession, createAccount, createSession } = setupCommand({ dbConnection })

    const account = await createAccount({ username: 'testuser', password: 'password123' })
    const session = await createSession(account.id)

    // 16 days in the future
    withSystemTime(new Date(Date.now() + 16 * 24 * 60 * 60 * 1000))

    const result = await validateSession.execute(session.token)

    expect(result.account).toBeDefined()
    expect(result.account?.username).toBe('testuser')
    expect(result.session).toBeDefined()
    expect(result.session?.tokenHash).toBe(session.tokenHash)
    expect(result.cookie).toBeInstanceOf(Cookie)
    expect(result.cookie?.value).toBe(session.token)
  })

  test('should return account and session without cookie when session is valid but not extended', async ({
    dbConnection,
  }) => {
    const { validateSession, createAccount, createSession } = setupCommand({ dbConnection })

    const account = await createAccount({ username: 'testuser', password: 'password123' })
    const session = await createSession(account.id)

    const result = await validateSession.execute(session.token)

    expect(result.account).toBeDefined()
    expect(result.account?.username).toBe('testuser')
    expect(result.session).toBeDefined()
    expect(result.session?.tokenHash).toBe(session.tokenHash)
    expect(result.cookie).toBeUndefined()
  })
})
