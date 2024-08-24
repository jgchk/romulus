import bcryptjs from 'bcryptjs'

import { Account } from '../domain/account'
import type { Cookie } from '../domain/cookie'
import { Session } from '../domain/session'
import {
  type AccountRepository,
  NonUniqueUsernameError,
} from '../infrastructure/account/account-repository'
import type { SessionRepository } from '../infrastructure/session/session-repository'

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

  hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 12)
  }
}
