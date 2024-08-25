import type { AppLucia } from '$lib/server/auth'

import { Cookie } from '../../domain/cookie'
import type { NewSession } from '../../domain/session'
import { CreatedSession } from '../../domain/session'
import type { SessionRepository } from './session-repository'

export class LuciaSessionRepository implements SessionRepository {
  constructor(private lucia: AppLucia) {}

  async findById(sessionId: string): Promise<CreatedSession | undefined> {
    const { session } = await this.lucia.validateSession(sessionId)
    if (!session) return
    return new CreatedSession(session.id, session.userId, session.fresh)
  }

  async create(session: NewSession): Promise<string> {
    const output = await this.lucia.createSession(session.accountId, {})
    return output.id
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
