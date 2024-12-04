import type { HashRepository } from '$lib/server/features/common/domain/repositories/hash'

import type { SessionRepository } from '../../domain/repositories/session'

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
