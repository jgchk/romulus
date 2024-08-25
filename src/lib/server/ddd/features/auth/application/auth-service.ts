import bcryptjs from 'bcryptjs'
import { sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'

import { NewAccount } from '../domain/account'
import type { Cookie } from '../domain/cookie'
import type { PasswordResetToken } from '../domain/password-reset-token'
import { Session } from '../domain/session'
import {
  type AccountRepository,
  NonUniqueUsernameError,
} from '../infrastructure/account/account-repository'
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
  ) {}

  async register(username: string, password: string): Promise<Cookie | NonUniqueUsernameError> {
    const account = new NewAccount({
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

  async checkPasswordResetToken(
    verificationToken: string,
  ): Promise<PasswordResetToken | ExpiredPasswordResetTokenError> {
    const tokenHash = await this.hashPasswordResetToken(verificationToken)
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

    const updatedAccount = account.withUpdate({
      passwordHash: await this.hashPassword(newPassword),
    })
    await this.accountRepo.update(passwordResetToken.accountId, updatedAccount)

    // Sign out the account everywhere
    await this.sessionRepo.deleteAllForAccount(passwordResetToken.accountId)

    await this.passwordResetTokenRepo.deleteByTokenHash(passwordResetToken.tokenHash)

    const session = new Session(account.id)
    const sessionId = await this.sessionRepo.create(session)

    const cookie = this.sessionRepo.createCookie(sessionId)

    return cookie
  }

  private hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 12)
  }

  private checkPassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash)
  }

  private async hashPasswordResetToken(token: string): Promise<string> {
    return encodeHex(await sha256(new TextEncoder().encode(token)))
  }
}
