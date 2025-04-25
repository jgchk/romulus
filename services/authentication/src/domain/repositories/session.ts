import { type Session } from '../entities/session.js'

export type SessionRepository = {
  findByTokenHash(tokenHash: string): Promise<Session | undefined>
  findByAccountId(accountId: number): Promise<Session[]>

  save(session: Session): Promise<void>
  delete(tokenHash: string): Promise<void>
  deleteAllForAccount(accountId: number): Promise<void>
}
