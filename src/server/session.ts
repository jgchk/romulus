import RedisHelper from './redis'
import crypto from 'node:crypto'

const TTL = 60 * 20 // 20 minutes

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
    return this.cache.stash('sessions', key, session, ttl)
  }

  getSession(token: string) {
    return this.cache.fetch<Session>('sessions', token)
  }
}
