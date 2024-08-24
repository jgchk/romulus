import type { AppLucia } from '$lib/server/auth'

import { Cookie } from '../../domain/cookie'
import type { Session } from '../../domain/session'
import type { SessionRepository } from './session-repository'

export class LuciaSessionRepository implements SessionRepository {
  constructor(private lucia: AppLucia) {}

  async create(session: Session): Promise<string> {
    const output = await this.lucia.createSession(session.accountId, {})
    return output.id
  }

  async delete(sessionId: string): Promise<void> {
    await this.lucia.invalidateSession(sessionId)
  }

  createCookie(sessionId: string): Cookie {
    const sessionCookie = this.lucia.createSessionCookie(sessionId)
    return new Cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  }
}
