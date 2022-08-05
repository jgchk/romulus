import crypto from 'node:crypto'

import { isNotNull } from '../utils/types'
import RedisHelper from './redis'

const TTL = 60 * 20 // 20 minutes
const SESSION_DB = 'sessions'

const createToken = () => crypto.randomBytes(16).toString('base64')

export type Session = {
  id: string
  accountId: number
}

export default class SessionManager {
  cache: RedisHelper

  constructor() {
    this.cache = new RedisHelper()
  }

  async createSession(accountId: number) {
    const token = createToken()

    const session: Session = {
      id: token,
      accountId,
    }

    await this.stashSession(token, session, TTL)

    return { token, session }
  }

  stashSession(key: string, session: Session, ttl: number) {
    return this.cache.stash(SESSION_DB, key, session, ttl)
  }

  getSession(token: string) {
    return this.cache.fetch<Session>(SESSION_DB, token)
  }

  async clearSession(token: string) {
    return this.cache.purge(SESSION_DB, token)
  }

  async clearAccountSessions(token: string) {
    const session = await this.getSession(token)
    if (!session) {
      throw new Error(`No session found for '${token}'`)
    }

    const accountId = session.accountId

    const allSessions = await this.cache.fetchAll<Session>(SESSION_DB)

    const accountSessions = Object.values(allSessions)
      .filter(isNotNull)
      .filter((session) => session.accountId === accountId)

    return Promise.all(
      accountSessions.map((session) => this.cache.purge(SESSION_DB, session.id))
    )
  }
}
