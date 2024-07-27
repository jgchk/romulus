import { eq, inArray } from 'drizzle-orm'

import { hasUpdate, makeUpdate } from '$lib/utils/db'

import type { IDrizzleConnection } from '../connection'
import { type Account, accounts, type InsertAccount } from '../schema'

export interface IAccountsDatabase<T> {
  insert: (data: InsertAccount[], conn: T) => Promise<Account[]>
  findById: (id: Account['id'], conn: T) => Promise<Account | undefined>
  findByUsername: (username: Account['username'], conn: T) => Promise<Account | undefined>
  update: (id: number, update: Partial<InsertAccount>, conn: T) => Promise<Account>
  deleteByUsername: (usernames: Account['username'][], conn: T) => Promise<void>
  deleteAll: (conn: T) => Promise<void>
}

export class AccountsDatabase implements IAccountsDatabase<IDrizzleConnection> {
  insert(data: InsertAccount[], conn: IDrizzleConnection) {
    return conn.insert(accounts).values(data).returning()
  }

  findById(id: Account['id'], conn: IDrizzleConnection) {
    return conn.query.accounts.findFirst({
      where: eq(accounts.id, id),
    })
  }

  findByUsername(username: Account['username'], conn: IDrizzleConnection) {
    return conn.query.accounts.findFirst({
      where: eq(accounts.username, username),
    })
  }

  async update(id: number, update: Partial<InsertAccount>, conn: IDrizzleConnection) {
    if (!hasUpdate(update)) {
      const account = await this.findById(id, conn)
      if (!account) throw new Error(`Account not found: ${id}`)
      return account
    }

    const [account] = await conn
      .update(accounts)
      .set(makeUpdate(update))
      .where(eq(accounts.id, id))
      .returning()

    return account
  }

  async deleteByUsername(usernames: Account['username'][], conn: IDrizzleConnection) {
    await conn.delete(accounts).where(inArray(accounts.username, usernames))
  }

  async deleteAll(conn: IDrizzleConnection) {
    await conn.delete(accounts)
  }
}
