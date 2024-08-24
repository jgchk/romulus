import type { Cookie } from '../../domain/cookie'
import type { Session } from '../../domain/session'

export type SessionRepository = {
  create(session: Session): Promise<string>
  createCookie(sessionId: string): Cookie
}
