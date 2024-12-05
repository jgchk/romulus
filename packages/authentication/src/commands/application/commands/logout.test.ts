import { describe, expect } from 'vitest'

import type { IDrizzleConnection } from '../../../shared/infrastructure/drizzle-database'
import { test } from '../../../vitest-setup'
import { NewAccount } from '../../domain/entities/account'
import { BcryptHashRepository } from '../../infrastructure/bcrypt-hash-repository'
import { CryptoTokenGenerator } from '../../infrastructure/crypto-token-generator'
import { DrizzleAccountRepository } from '../../infrastructure/drizzle-account-repository'
import { DrizzleSessionRepository } from '../../infrastructure/drizzle-session-repository'
import { Sha256HashRepository } from '../../infrastructure/sha256-hash-repository'
import { LoginCommand } from './login'
import { LogoutCommand } from './logout'

function setupCommand(options: { dbConnection: IDrizzleConnection }) {
  const sessionRepo = new DrizzleSessionRepository(options.dbConnection)
  const sessionTokenHashRepo = new Sha256HashRepository()

  const logout = new LogoutCommand(sessionRepo, sessionTokenHashRepo)

  async function createLoggedInAccount(loggedInAccount: { username: string; password: string }) {
    const accountRepo = new DrizzleAccountRepository(options.dbConnection)
    const passwordHashRepo = new BcryptHashRepository()
    const sessionTokenGenerator = new CryptoTokenGenerator()

    const account = await accountRepo.create(
      new NewAccount({
        username: loggedInAccount.username,
        passwordHash: await passwordHashRepo.hash(loggedInAccount.password),
      }),
    )
    if (account instanceof Error) {
      expect.fail(`Account creation failed: ${account.message}`)
    }

    const login = new LoginCommand(
      accountRepo,
      sessionRepo,
      passwordHashRepo,
      sessionTokenHashRepo,
      sessionTokenGenerator,
    )
    const loginResult = await login.execute(loggedInAccount.username, loggedInAccount.password)

    if (loginResult instanceof Error) {
      expect.fail(`Login failed: ${loginResult.message}`)
    }

    return loginResult
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
    const { userSession } = await createLoggedInAccount({
      username: 'testaccount',
      password: 'password123',
    })

    const logoutResult = await logout.execute(userSession.token)

    expect(logoutResult).toBeUndefined()
  })

  test('should delete the session on logout', async ({ dbConnection }) => {
    const { logout, createLoggedInAccount, getAccountSessions } = setupCommand({ dbConnection })
    const { userSession } = await createLoggedInAccount({
      username: 'sessionaccount',
      password: 'password123',
    })

    await logout.execute(userSession.token)

    const sessions = await getAccountSessions('sessionaccount')
    expect(sessions).toHaveLength(0)
  })

  test('should return an empty cookie when logging out with invalid session ID', async ({
    dbConnection,
  }) => {
    const { logout } = setupCommand({ dbConnection })

    const result = await logout.execute('invalid_session_id')

    expect(result).toBeUndefined()
  })
})
