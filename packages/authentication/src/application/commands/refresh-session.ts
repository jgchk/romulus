import { UnauthorizedError } from '../../commands/domain/errors/unauthorized'
import type { HashRepository } from '../../commands/domain/repositories/hash-repository'
import type { SessionRepository } from '../../commands/domain/repositories/session'

export type RefreshSessionResult = {
  token: string
  expiresAt: Date
}

export class RefreshSessionCommand {
  constructor(
    private sessionRepo: SessionRepository,
    private sessionTokenHashRepo: HashRepository,
  ) {}

  async execute(sessionToken: string): Promise<RefreshSessionResult | UnauthorizedError> {
    const tokenHash = await this.sessionTokenHashRepo.hash(sessionToken)

    const session = await this.sessionRepo.findByTokenHash(tokenHash)
    if (!session) {
      return new UnauthorizedError()
    }

    if (Date.now() >= session.expiresAt.getTime()) {
      await this.sessionRepo.delete(tokenHash)
      return new UnauthorizedError()
    }

    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

    await this.sessionRepo.save(session)

    return { token: sessionToken, expiresAt: session.expiresAt }
  }
}
