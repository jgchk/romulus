import { eq } from 'drizzle-orm'

import type { NewAccount } from '../domain/entities/account'
import { CreatedAccount } from '../domain/entities/account'
import { NonUniqueUsernameError } from '../domain/errors/non-unique-username'
import type { AccountRepository } from '../domain/repositories/account'
import type { IDrizzleConnection } from './drizzle-database'
import { accountsTable } from './drizzle-schema'

export class DrizzleAccountRepository implements AccountRepository {
  constructor(private db: IDrizzleConnection) {}

  async findById(id: number): Promise<CreatedAccount | undefined> {
    const entry = await this.db.query.accountsTable.findFirst({
      where: (accounts, { eq }) => eq(accounts.id, id),
    })
    if (!entry) return

    const account = new CreatedAccount(entry.id, {
      username: entry.username,
      passwordHash: entry.password,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    })

    return account
  }

  async findByUsername(username: string): Promise<CreatedAccount | undefined> {
    const entry = await this.db.query.accountsTable.findFirst({
      where: (accounts, { eq }) => eq(accounts.username, username),
    })
    if (!entry) return

    const account = new CreatedAccount(entry.id, {
      username: entry.username,
      passwordHash: entry.password,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    })

    return account
  }

  async create(account: NewAccount): Promise<CreatedAccount | NonUniqueUsernameError> {
    try {
      const [{ accountId }] = await this.db
        .insert(accountsTable)
        .values({
          username: account.username,
          password: account.passwordHash,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        })
        .returning({ accountId: accountsTable.id })

      return new CreatedAccount(accountId, account)
    } catch (error) {
      if (isPostgresError(error, '23505', 'Account_username_unique')) {
        return new NonUniqueUsernameError(account.username)
      }
      throw error
    }
  }

  async update(id: number, account: NewAccount): Promise<void> {
    await this.db
      .update(accountsTable)
      .set({
        username: account.username,
        password: account.passwordHash,
        updatedAt: account.updatedAt,
      })
      .where(eq(accountsTable.id, id))
  }
}

function isPostgresError(error: unknown, code: string, constraint: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code &&
    (('constraint' in error && error.constraint === constraint) ||
      ('constraint_name' in error && error.constraint_name === constraint))
  )
}
