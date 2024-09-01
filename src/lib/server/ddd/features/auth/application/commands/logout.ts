import type { Cookie } from '../../domain/entities/cookie'
import type { SessionRepository } from '../../domain/repositories/session'

export class LogoutCommand {
  constructor(private sessionRepo: SessionRepository) {}

  async execute(sessionId: string): Promise<Cookie> {
    await this.sessionRepo.delete(sessionId)

    const cookie = this.sessionRepo.createCookie(undefined)

    return cookie
  }
}
