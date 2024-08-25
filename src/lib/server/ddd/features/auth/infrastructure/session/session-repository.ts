import type { Cookie } from '../../domain/cookie'
import type { CreatedSession, NewSession } from '../../domain/session'

export type SessionRepository = {
  findById(sessionId: string): Promise<CreatedSession | undefined>
  create(session: NewSession): Promise<string>
  delete(sessionId: string): Promise<void>
  deleteAllForAccount(accountId: number): Promise<void>

  createCookie(sessionId: string | undefined): Cookie
}
