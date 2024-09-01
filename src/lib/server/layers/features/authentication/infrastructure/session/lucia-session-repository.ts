import { Cookie } from '../../domain/entities/cookie'
import type { NewSession } from '../../domain/entities/session'
import { CreatedSession } from '../../domain/entities/session'
import type { SessionRepository } from '../../domain/repositories/session'
import type { AppLucia } from './lucia'

export class LuciaSessionRepository implements SessionRepository {
  constructor(private lucia: AppLucia) {}

  async findById(sessionId: string): Promise<CreatedSession | undefined> {
    const { session } = await this.lucia.validateSession(sessionId)
    if (!session) return
    return new CreatedSession(session.id, session.userId, session.fresh)
  }

  async findByAccountId(accountId: number): Promise<CreatedSession[]> {
    const sessions = await this.lucia.getUserSessions(accountId)
    return sessions.map((session) => new CreatedSession(session.id, session.userId, session.fresh))
  }

  async create(session: NewSession): Promise<CreatedSession> {
    const output = await this.lucia.createSession(session.accountId, {})
    return new CreatedSession(output.id, output.userId, output.fresh)
  }

  async delete(sessionId: string): Promise<void> {
    await this.lucia.invalidateSession(sessionId)
  }

  async deleteAllForAccount(accountId: number): Promise<void> {
    await this.lucia.invalidateUserSessions(accountId)
  }

  createCookie(sessionId: string | undefined): Cookie {
    const sessionCookie =
      sessionId === undefined
        ? this.lucia.createBlankSessionCookie()
        : this.lucia.createSessionCookie(sessionId)

    return new Cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  }
}
