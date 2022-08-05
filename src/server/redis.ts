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

  async fetchAll<T>(db: string): Promise<Record<string, T | null>> {
    const dbKey = getDbKey(db, '*')
    const keys = await this.client.keys(dbKey)

    const keyValues = await Promise.all(
      keys.map(async (key): Promise<[string, T | null]> => {
        const data = await this.client.get(key)

        if (data === null) {
          return [key, null]
        }

        return [key, JSON.parse(data) as T]
      })
    )

    return Object.fromEntries(keyValues)
  }

  purge(db: string, key: string) {
    const dbKey = getDbKey(db, key)
    return this.client.del(dbKey)
  }
}
