import { eq, inArray } from 'drizzle-orm'

import { hasUpdate, makeUpdate } from '$lib/utils/db'

import type { DbConnection } from '../connection'
import { type Account, accounts, type InsertAccount } from '../schema'

export interface IAccountsDatabase {
  insert: (...data: InsertAccount[]) => Promise<Account[]>
  findById: (id: Account['id']) => Promise<Account | undefined>
  findByUsername: (username: Account['username']) => Promise<Account | undefined>
  update: (id: number, update: Partial<InsertAccount>) => Promise<Account>
  deleteByUsername: (...usernames: Account['username'][]) => Promise<void>
  deleteAll: () => Promise<void>
}

export class AccountsDatabase implements IAccountsDatabase {
  constructor(private db: DbConnection) {}

  insert(...data: InsertAccount[]) {
    return this.db.insert(accounts).values(data).returning()
  }

  findById(id: Account['id']) {
    return this.db.query.accounts.findFirst({
      where: eq(accounts.id, id),
    })
  }

  findByUsername(username: Account['username']) {
    return this.db.query.accounts.findFirst({
      where: eq(accounts.username, username),
    })
  }

  async update(id: number, update: Partial<InsertAccount>) {
    if (!hasUpdate(update)) {
      const account = await this.findById(id)
      if (!account) throw new Error(`Account not found: ${id}`)
      return account
    }

    const [account] = await this.db
      .update(accounts)
      .set(makeUpdate(update))
      .where(eq(accounts.id, id))
      .returning()

    return account
  }

  async deleteByUsername(...usernames: Account['username'][]) {
    await this.db.delete(accounts).where(inArray(accounts.username, usernames))
  }

  async deleteAll() {
    await this.db.delete(accounts)
  }
}
