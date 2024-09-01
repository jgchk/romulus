import type { CreatedAccount } from '../../domain/entities/account'
import type { Cookie } from '../../domain/entities/cookie'
import type { CreatedSession } from '../../domain/entities/session'
import type { AccountRepository } from '../../domain/repositories/account'
import type { SessionRepository } from '../../domain/repositories/session'

export class ValidateSessionCommand {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
  ) {}

  async execute(sessionId: string | undefined): Promise<{
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
}
