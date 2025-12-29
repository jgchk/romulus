import { count, eq, ilike } from 'drizzle-orm'

import type { NewAccount } from '../domain/entities/account.js'
import { CreatedAccount } from '../domain/entities/account.js'
import { NonUniqueUsernameError } from '../domain/errors/non-unique-username.js'
import type {
  AccountRepository,
  FindAllOptions,
  FindAllResult,
} from '../domain/repositories/account.js'
import type { IDrizzleConnection } from './drizzle-database.js'
import { accountsTable } from './drizzle-schema.js'

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

  async findByIds(ids: number[]): Promise<CreatedAccount[]> {
    const entries = await this.db.query.accountsTable.findMany({
      where: (accounts, { inArray }) => inArray(accounts.id, ids),
    })

    return entries.map(
      (entry) =>
        new CreatedAccount(entry.id, {
          username: entry.username,
          passwordHash: entry.password,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        }),
    )
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

  async findAll(options?: FindAllOptions): Promise<FindAllResult> {
    const limit = options?.limit ?? 50
    const offset = options?.offset ?? 0
    const usernameFilter = options?.username

    const whereClause = usernameFilter
      ? ilike(accountsTable.username, `%${usernameFilter}%`)
      : undefined

    const entries = await this.db.query.accountsTable.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (accounts, { asc }) => asc(accounts.id),
    })

    const [countResult] = await this.db
      .select({ count: count() })
      .from(accountsTable)
      .where(whereClause)

    const accounts = entries.map(
      (entry) =>
        new CreatedAccount(entry.id, {
          username: entry.username,
          passwordHash: entry.password,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        }),
    )

    return { accounts, total: countResult?.count ?? 0 }
  }

  async create(account: NewAccount): Promise<CreatedAccount | NonUniqueUsernameError> {
    try {
      const results = await this.db
        .insert(accountsTable)
        .values({
          username: account.username,
          password: account.passwordHash,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        })
        .returning({ accountId: accountsTable.id })
      const accountId = results[0]!.accountId
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

  async delete(id: number): Promise<void> {
    await this.db.delete(accountsTable).where(eq(accountsTable.id, id))
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
