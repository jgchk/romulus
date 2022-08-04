import Redis from 'ioredis'
import { env } from './env'

const getDbKey = (db: string, key: string) => `${db}:${key}`

export default class RedisHelper {
  client: Redis

  constructor() {
    const redisUrl = env.REDIS_URL

    if (redisUrl === undefined) {
      throw new Error(
        'No REDIS_URL found. Please provide one as an environment variable.'
      )
    }

    this.client = new Redis(redisUrl)
  }

  async stash<T>(db: string, key: string, data: T, ttl: number) {
    const dbKey = getDbKey(db, key)
    await this.client.set(dbKey, JSON.stringify(data))
    if (ttl > 0) {
      await this.client.expire(dbKey, ttl)
    }
  }

  async fetch<T>(db: string, key: string) {
    const dbKey = getDbKey(db, key)
    const data = await this.client.get(dbKey)

    if (data === null) {
      return null
    }

    return JSON.parse(data) as T
  }
}
