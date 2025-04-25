import { UnauthorizedError } from '../../domain/errors/unauthorized.js'
import { type HashRepository } from '../../domain/repositories/hash-repository.js'
import { type SessionRepository } from '../../domain/repositories/session.js'

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
