import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { sessions } from '$lib/server/db/schema'

import { Session } from '../../domain/entities/session'
import type { SessionRepository } from '../../domain/repositories/session'

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private db: IDrizzleConnection) {}

  async findByTokenHash(tokenHash: string): Promise<Session | undefined> {
    const result = await this.db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.tokenHash, tokenHash),
    })

    if (!result) return

    return new Session(result.userId, result.tokenHash, result.expiresAt)
  }

  async findByAccountId(accountId: number): Promise<Session[]> {
    const sessions = await this.db.query.sessions.findMany({
      where: (sessions, { eq }) => eq(sessions.userId, accountId),
    })
    return sessions.map(
      (session) => new Session(session.userId, session.tokenHash, session.expiresAt),
    )
  }

  async save(session: Session): Promise<void> {
    await this.db
      .insert(sessions)
      .values({
        tokenHash: session.tokenHash,
        userId: session.accountId,
        expiresAt: session.expiresAt,
      })
      .onConflictDoUpdate({
        target: [sessions.tokenHash],
        set: {
          userId: session.accountId,
          expiresAt: session.expiresAt,
        },
      })
      .returning({ tokenHash: sessions.tokenHash })
  }

  async delete(tokenHash: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.tokenHash, tokenHash))
  }

  async deleteAllForAccount(accountId: number): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, accountId))
  }
}
