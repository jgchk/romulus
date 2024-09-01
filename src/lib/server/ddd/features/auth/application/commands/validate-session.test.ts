import { describe, expect } from 'vitest'

import { createLucia } from '$lib/server/auth'
import type { IDrizzleConnection } from '$lib/server/db/connection'

import { test } from '../../../../../../../vitest-setup'
import { NewAccount } from '../../domain/entities/account'
import { Cookie } from '../../domain/entities/cookie'
import { NewSession } from '../../domain/entities/session'
import { NonUniqueUsernameError } from '../../domain/errors/non-unique-username'
import { DrizzleAccountRepository } from '../../infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '../../infrastructure/hash/bcrypt-hash-repository'
import { LuciaSessionRepository } from '../../infrastructure/session/lucia-session-repository'
import { ValidateSessionCommand } from './validate-session'

function setupCommand(options: { dbConnection: IDrizzleConnection }) {
  const accountRepo = new DrizzleAccountRepository(options.dbConnection)
  const sessionRepo = new LuciaSessionRepository(createLucia(options.dbConnection))

  const validateSession = new ValidateSessionCommand(accountRepo, sessionRepo)

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
    const session = new NewSession(accountId)
    const sessionId = await sessionRepo.create(session)
    return sessionId
  }

  return { validateSession, createAccount, createSession }
}

describe('validateSession', () => {
  test('should return undefined values when sessionId is undefined', async ({ dbConnection }) => {
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

    const result = await validateSession.execute(session.id)

    expect(result.account).toBeDefined()
    expect(result.account?.username).toBe('testuser')
    expect(result.session).toBeDefined()
    expect(result.session?.id).toBe(session.id)
    expect(result.session?.wasJustExtended).toBe(true)
    expect(result.cookie).toBeInstanceOf(Cookie)
    expect(result.cookie?.value).toBe(session.id)
  })

  test('should return account and session without cookie when session is valid but not extended', async ({
    dbConnection,
  }) => {
    const { validateSession, createAccount, createSession } = setupCommand({ dbConnection })

    const account = await createAccount({ username: 'testuser', password: 'password123' })
    const session = await createSession(account.id)

    const result = await validateSession.execute(session.id)

    expect(result.account).toBeDefined()
    expect(result.account?.username).toBe('testuser')
    expect(result.session).toBeDefined()
    expect(result.session?.id).toBe(session.id)
    expect(result.session?.wasJustExtended).toBe(false)
    expect(result.cookie).toBeUndefined()
  })
})
