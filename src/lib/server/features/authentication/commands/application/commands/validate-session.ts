import type { HashRepository } from '$lib/server/features/common/domain/repositories/hash'

import type { CreatedAccount } from '../../domain/entities/account'
import type { Cookie } from '../../domain/entities/cookie'
import type { Session } from '../../domain/entities/session'
import type { AccountRepository } from '../../domain/repositories/account'
import type { SessionRepository } from '../../domain/repositories/session'

export class ValidateSessionCommand {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private sessionTokenHashRepo: HashRepository,
  ) {}

  async execute(sessionToken: string | undefined): Promise<{
    account: CreatedAccount | undefined
    session: Session | undefined
    cookie: Cookie | undefined
  }> {
    if (!sessionToken) {
      return { account: undefined, session: undefined, cookie: undefined }
    }

    const tokenHash = await this.sessionTokenHashRepo.hash(sessionToken)

    const session = await this.sessionRepo.findByTokenHash(tokenHash)

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

    if (Date.now() >= session.expiresAt.getTime()) {
      await this.sessionRepo.delete(tokenHash)
      const cookie = this.sessionRepo.createCookie(undefined)
      return { account: undefined, session: undefined, cookie }
    }

    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      await this.sessionRepo.save(session)
      const cookie = this.sessionRepo.createCookie({
        token: sessionToken,
        expiresAt: session.expiresAt,
      })
      return { account, session, cookie }
    }

    // Session was found and doesn't need updated
    return { account, session, cookie: undefined }
  }
}
