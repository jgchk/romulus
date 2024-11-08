import type { HashRepository } from '$lib/server/features/common/domain/repositories/hash'

import type { Cookie } from '../../domain/entities/cookie'
import type { SessionRepository } from '../../domain/repositories/session'

export class LogoutCommand {
  constructor(
    private sessionRepo: SessionRepository,
    private sessionTokenHashRepo: HashRepository,
  ) {}

  async execute(sessionToken: string): Promise<Cookie> {
    const tokenHash = await this.sessionTokenHashRepo.hash(sessionToken)

    await this.sessionRepo.delete(tokenHash)

    const cookie = this.sessionRepo.createCookie(undefined)

    return cookie
  }
}
