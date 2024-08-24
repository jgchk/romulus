import bcryptjs from 'bcryptjs'

import { Account } from '../domain/account'
import type { Cookie } from '../domain/cookie'
import { Session } from '../domain/session'
import {
  type AccountRepository,
  NonUniqueUsernameError,
} from '../infrastructure/account/account-repository'
import type { SessionRepository } from '../infrastructure/session/session-repository'

export class InvalidLoginError extends Error {
  constructor() {
    super('Incorrect username or password')
  }
}

export class AuthService {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
  ) {}

  async register(username: string, password: string): Promise<Cookie | NonUniqueUsernameError> {
    const account = new Account({
      username,
      passwordHash: await this.hashPassword(password),
    })

    const maybeAccountId = await this.accountRepo.create(account)
    if (maybeAccountId instanceof NonUniqueUsernameError) {
      return maybeAccountId
    }
    const accountId = maybeAccountId

    const session = new Session(accountId)
    const sessionId = await this.sessionRepo.create(session)

    const cookie = this.sessionRepo.createCookie(sessionId)

    return cookie
  }

  async login(username: string, password: string): Promise<Cookie | InvalidLoginError> {
    const account = await this.accountRepo.findByUsername(username)
    if (!account) {
      // spend some time to "waste" some time
      // this makes brute forcing harder
      await this.hashPassword(password)
      return new InvalidLoginError()
    }

    const validPassword = await this.checkPassword(password, account.passwordHash)
    if (!validPassword) {
      return new InvalidLoginError()
    }

    const session = new Session(account.id)
    const sessionId = await this.sessionRepo.create(session)

    const cookie = this.sessionRepo.createCookie(sessionId)

    return cookie
  }

  async logout(sessionId: string): Promise<Cookie> {
    await this.sessionRepo.delete(sessionId)

    const cookie = this.sessionRepo.createCookie(undefined)

    return cookie
  }

  hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 12)
  }

  checkPassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash)
  }
}
