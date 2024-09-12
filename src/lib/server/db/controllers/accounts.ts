import { eq, inArray } from 'drizzle-orm'

import { hasUpdate, makeUpdate } from '$lib/utils/db'

import type { IDrizzleConnection } from '../connection'
import { type Account, accounts, type InsertAccount } from '../schema'

export class AccountsDatabase {
  insert(data: InsertAccount[], conn: IDrizzleConnection): Promise<Account[]> {
    return conn.insert(accounts).values(data).returning()
  }

  findById(id: Account['id'], conn: IDrizzleConnection): Promise<Account | undefined> {
    return conn.query.accounts.findFirst({
      where: eq(accounts.id, id),
    })
  }

  async update(
    id: number,
    update: Partial<InsertAccount>,
    conn: IDrizzleConnection,
  ): Promise<Account> {
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

  async deleteByUsername(
    usernames: Account['username'][],
    conn: IDrizzleConnection,
  ): Promise<void> {
    if (usernames.length === 0) return
    await conn.delete(accounts).where(inArray(accounts.username, usernames))
  }
}
