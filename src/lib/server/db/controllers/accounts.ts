
import type { IDrizzleConnection } from '../connection'
import { type Account, accounts, type InsertAccount } from '../schema'

export class AccountsDatabase {
  insert(data: InsertAccount[], conn: IDrizzleConnection): Promise<Account[]> {
    return conn.insert(accounts).values(data).returning()
  }
}
