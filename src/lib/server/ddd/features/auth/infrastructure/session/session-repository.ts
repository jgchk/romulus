import type { Cookie } from '../../domain/cookie'
import type { Session } from '../../domain/session'

export type SessionRepository = {
  create(session: Session): Promise<string>
  delete(sessionId: string): Promise<void>
  deleteAllForAccount(accountId: number): Promise<void>

  createCookie(sessionId: string | undefined): Cookie
}
