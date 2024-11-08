import { describe, expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { Sha256HashRepository } from '$lib/server/features/common/infrastructure/repositories/hash/sha256-hash-repository'

import { test } from '../../../../../../../vitest-setup'
import { CryptoTokenGenerator } from '../../../../common/infrastructure/token/crypto-token-generator'
import { NewAccount } from '../../domain/entities/account'
import { Cookie } from '../../domain/entities/cookie'
import { DrizzleAccountRepository } from '../../infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '../../infrastructure/hash/bcrypt-hash-repository'
import { DrizzleSessionRepository } from '../../infrastructure/session/drizzle-session-repository'
import { LoginCommand } from './login'
import { LogoutCommand } from './logout'

function setupCommand(options: { dbConnection: IDrizzleConnection }) {
  const sessionRepo = new DrizzleSessionRepository(options.dbConnection, false, 'auth_session')
  const sessionTokenHashRepo = new Sha256HashRepository()

  const logout = new LogoutCommand(sessionRepo, sessionTokenHashRepo)

  async function createLoggedInAccount(loggedInAccount: { username: string; password: string }) {
    const accountRepo = new DrizzleAccountRepository(options.dbConnection)
    const passwordHashRepo = new BcryptHashRepository()
    const sessionTokenGenerator = new CryptoTokenGenerator()

    await accountRepo.create(
      new NewAccount({
        username: loggedInAccount.username,
        passwordHash: await passwordHashRepo.hash(loggedInAccount.password),
      }),
    )

    const login = new LoginCommand(
      accountRepo,
      sessionRepo,
      passwordHashRepo,
      sessionTokenHashRepo,
      sessionTokenGenerator,
    )
    const cookie = await login.execute(loggedInAccount.username, loggedInAccount.password)

    if (!(cookie instanceof Cookie)) {
      expect.fail('Login failed')
    }

    return { cookie }
  }

  async function getAccountSessions(username: string) {
    const accountRepo = new DrizzleAccountRepository(options.dbConnection)

    const account = await accountRepo.findByUsername(username)
    if (!account) return []

    const sessions = await sessionRepo.findByAccountId(account.id)
    return sessions
  }

  return { logout, createLoggedInAccount, getAccountSessions }
}

describe('logout', () => {
  test('should logout an account successfully', async ({ dbConnection }) => {
    const { logout, createLoggedInAccount } = setupCommand({ dbConnection })
    const { cookie } = await createLoggedInAccount({
      username: 'testaccount',
      password: 'password123',
    })

    const logoutResult = await logout.execute(cookie.value)

    expect(logoutResult).toBeInstanceOf(Cookie)
    expect(logoutResult.value).toBe('')
  })

  test('should delete the session on logout', async ({ dbConnection }) => {
    const { logout, createLoggedInAccount, getAccountSessions } = setupCommand({ dbConnection })
    const { cookie } = await createLoggedInAccount({
      username: 'sessionaccount',
      password: 'password123',
    })

    await logout.execute(cookie.value)

    const sessions = await getAccountSessions('sessionaccount')
    expect(sessions).toHaveLength(0)
  })

  test('should return an empty cookie when logging out with invalid session ID', async ({
    dbConnection,
  }) => {
    const { logout } = setupCommand({ dbConnection })

    const result = await logout.execute('invalid_session_id')

    expect(result).toBeInstanceOf(Cookie)
    expect(result.value).toBe('')
  })
})
