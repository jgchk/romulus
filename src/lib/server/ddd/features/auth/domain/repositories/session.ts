import type { Cookie } from '../entities/cookie'
import type { CreatedSession, NewSession } from '../entities/session'

export type SessionRepository = {
  findById(sessionId: string): Promise<CreatedSession | undefined>
  findByAccountId(accountId: number): Promise<CreatedSession[]>

  create(session: NewSession): Promise<CreatedSession>
  delete(sessionId: string): Promise<void>
  deleteAllForAccount(accountId: number): Promise<void>

  createCookie(sessionId: string | undefined): Cookie
}
