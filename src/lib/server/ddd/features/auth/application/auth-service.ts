import type { CreatedAccount } from '../domain/account'
import { NewAccount } from '../domain/account'
import type { Cookie } from '../domain/cookie'
import type { PasswordResetToken } from '../domain/password-reset-token'
import type { CreatedSession } from '../domain/session'
import { NewSession } from '../domain/session'
import {
  type AccountRepository,
  NonUniqueUsernameError,
} from '../infrastructure/account/account-repository'
import type { HashRepository } from '../infrastructure/hash/hash-repository'
import type { PasswordResetTokenRepository } from '../infrastructure/password-reset-token/password-reset-token-repository'
import type { SessionRepository } from '../infrastructure/session/session-repository'

export class InvalidLoginError extends Error {
  constructor() {
    super('Incorrect username or password')
  }
}

export class AccountNotFoundError extends Error {
  constructor(public accountId: number) {
    super('Account not found')
  }
}

export class PasswordResetTokenNotFoundError extends Error {
  constructor() {
    super('Password reset token not found')
  }
}

export class ExpiredPasswordResetTokenError extends Error {
  constructor() {
    super('Password reset token has expired')
  }
}

export class AuthService {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private passwordResetTokenRepo: PasswordResetTokenRepository,
    private passwordHashRepo: HashRepository,
    private passwordResetTokenHashRepo: HashRepository,
  ) {}

  async register(username: string, password: string): Promise<Cookie | NonUniqueUsernameError> {
    const account = new NewAccount({
      username,
      passwordHash: await this.passwordHashRepo.hash(password),
    })

    const maybeAccountId = await this.accountRepo.create(account)
    if (maybeAccountId instanceof NonUniqueUsernameError) {
      return maybeAccountId
    }
    const accountId = maybeAccountId

    const session = new NewSession(accountId)
    const sessionId = await this.sessionRepo.create(session)

    const cookie = this.sessionRepo.createCookie(sessionId)

    return cookie
  }

  async login(username: string, password: string): Promise<Cookie | InvalidLoginError> {
    const account = await this.accountRepo.findByUsername(username)
    if (!account) {
      // spend some time to "waste" some time
      // this makes brute forcing harder
      await this.passwordHashRepo.hash(password)
      return new InvalidLoginError()
    }

    const validPassword = await this.passwordHashRepo.compare(password, account.passwordHash)
    if (!validPassword) {
      return new InvalidLoginError()
    }

    const session = new NewSession(account.id)
    const sessionId = await this.sessionRepo.create(session)

    const cookie = this.sessionRepo.createCookie(sessionId)

    return cookie
  }

  async logout(sessionId: string): Promise<Cookie> {
    await this.sessionRepo.delete(sessionId)

    const cookie = this.sessionRepo.createCookie(undefined)

    return cookie
  }

  async validateSession(sessionId: string | undefined): Promise<{
    account: CreatedAccount | undefined
    session: CreatedSession | undefined
    cookie: Cookie | undefined
  }> {
    if (!sessionId) {
      return { account: undefined, session: undefined, cookie: undefined }
    }

    const session = await this.sessionRepo.findById(sessionId)

    if (!session) {
      // Session was not found, clear the cookie
      const cookie = this.sessionRepo.createCookie(undefined)
      return { account: undefined, session: undefined, cookie }
    }

    const account = await this.accountRepo.findById(session.accountId)
    if (!account) {
      // Session was found, but account was not, clear the cookie
      const cookie = this.sessionRepo.createCookie(undefined)
      return { account: undefined, session: undefined, cookie }
    }

    if (session.wasJustExtended) {
      // Session was found and extended, update the cookie
      const cookie = this.sessionRepo.createCookie(session.id)
      return { account, session, cookie }
    }

    // Session was found and doesn't need updated
    return { account, session, cookie: undefined }
  }

  async checkPasswordResetToken(
    verificationToken: string,
  ): Promise<
    PasswordResetToken | PasswordResetTokenNotFoundError | ExpiredPasswordResetTokenError
  > {
    const tokenHash = await this.passwordResetTokenHashRepo.hash(verificationToken)
    const token = await this.passwordResetTokenRepo.findByTokenHash(tokenHash)

    if (!token) {
      return new PasswordResetTokenNotFoundError()
    }

    if (token.isExpired()) {
      return new ExpiredPasswordResetTokenError()
    }

    return token
  }

  async resetPassword(
    passwordResetToken: PasswordResetToken,
    newPassword: string,
  ): Promise<Cookie | AccountNotFoundError> {
    const account = await this.accountRepo.findById(passwordResetToken.accountId)
    if (!account) {
      return new AccountNotFoundError(passwordResetToken.accountId)
    }

    const updatedAccount = account.resetPassword(await this.passwordHashRepo.hash(newPassword))
    await this.accountRepo.update(passwordResetToken.accountId, updatedAccount)

    // Sign out the account everywhere
    await this.sessionRepo.deleteAllForAccount(passwordResetToken.accountId)

    await this.passwordResetTokenRepo.deleteByTokenHash(passwordResetToken.tokenHash)

    const session = new NewSession(account.id)
    const sessionId = await this.sessionRepo.create(session)

    const cookie = this.sessionRepo.createCookie(sessionId)

    return cookie
  }
}
