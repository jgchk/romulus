import { UnauthorizedError } from '../../domain/errors/unauthorized'
import type { AccountRepository } from '../../domain/repositories/account'
import type { HashRepository } from '../../domain/repositories/hash-repository'
import type { SessionRepository } from '../../domain/repositories/session'

export class WhoamiQuery {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private sessionTokenHashRepo: HashRepository,
  ) {}

  async execute(sessionToken: string): Promise<
    | {
        account: {
          id: number
          username: string
        }
        session: { expiresAt: Date }
      }
    | UnauthorizedError
  > {
    const tokenHash = await this.sessionTokenHashRepo.hash(sessionToken)

    const session = await this.sessionRepo.findByTokenHash(tokenHash)
    if (!session) {
      return new UnauthorizedError()
    }
    const sessionOutput = {
      expiresAt: session.expiresAt,
    }

    if (Date.now() >= session.expiresAt.getTime()) {
      await this.sessionRepo.delete(tokenHash)
      return new UnauthorizedError()
    }

    const account = await this.accountRepo.findById(session.accountId)
    if (!account) {
      return new UnauthorizedError()
    }

    const accountOutput = {
      id: account.id,
      username: account.username,
    }

    return {
      account: accountOutput,
      session: sessionOutput,
    }
  }
}
