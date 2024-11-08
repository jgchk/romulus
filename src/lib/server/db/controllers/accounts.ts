import { eq } from 'drizzle-orm'

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
}
