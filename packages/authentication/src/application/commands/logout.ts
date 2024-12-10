import type { HashRepository } from '../../commands/domain/repositories/hash-repository'
import type { SessionRepository } from '../../commands/domain/repositories/session'

export class LogoutCommand {
  constructor(
    private sessionRepo: SessionRepository,
    private sessionTokenHashRepo: HashRepository,
  ) {}

  async execute(sessionToken: string): Promise<void> {
    const tokenHash = await this.sessionTokenHashRepo.hash(sessionToken)

    await this.sessionRepo.delete(tokenHash)
  }
}
