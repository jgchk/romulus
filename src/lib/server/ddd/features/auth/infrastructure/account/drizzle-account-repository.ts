import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { accounts } from '$lib/server/db/schema'

import type { NewAccount } from '../../domain/account'
import { CreatedAccount } from '../../domain/account'
import { type AccountRepository, NonUniqueUsernameError } from './account-repository'

export class DrizzleAccountRepository implements AccountRepository {
  constructor(private db: IDrizzleConnection) {}

  async findById(id: number): Promise<CreatedAccount | undefined> {
    const entry = await this.db.query.accounts.findFirst({
      where: (accounts, { eq }) => eq(accounts.id, id),
    })
    if (!entry) return

    const account = new CreatedAccount(entry.id, {
      username: entry.username,
      passwordHash: entry.password,
      darkMode: entry.darkMode,
      permissions: new Set(entry.permissions ?? []),
      genreRelevanceFilter: entry.genreRelevanceFilter,
      showRelevanceTags: entry.showRelevanceTags,
      showTypeTags: entry.showTypeTags,
      showNsfw: entry.showNsfw,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    })

    return account
  }

  async findByUsername(username: string): Promise<CreatedAccount | undefined> {
    const entry = await this.db.query.accounts.findFirst({
      where: (accounts, { eq }) => eq(accounts.username, username),
    })
    if (!entry) return

    const account = new CreatedAccount(entry.id, {
      username: entry.username,
      passwordHash: entry.password,
      darkMode: entry.darkMode,
      permissions: new Set(entry.permissions ?? []),
      genreRelevanceFilter: entry.genreRelevanceFilter,
      showRelevanceTags: entry.showRelevanceTags,
      showTypeTags: entry.showTypeTags,
      showNsfw: entry.showNsfw,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    })

    return account
  }

  async create(account: NewAccount): Promise<number | NonUniqueUsernameError> {
    try {
      const [{ accountId }] = await this.db
        .insert(accounts)
        .values([
          {
            username: account.username,
            password: account.passwordHash,
            darkMode: account.darkMode,
            permissions: [...account.permissions],
            genreRelevanceFilter: account.genreRelevanceFilter,
            showRelevanceTags: account.showRelevanceTags,
            showTypeTags: account.showTypeTags,
            showNsfw: account.showNsfw,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
          },
        ])
        .returning({ accountId: accounts.id })

      return accountId
    } catch (error) {
      if (isPostgresError(error, '23505', 'Account_username_unique')) {
        return new NonUniqueUsernameError(account.username)
      }
      throw error
    }
  }

  async update(id: number, account: NewAccount): Promise<void> {
    await this.db
      .update(accounts)
      .set({
        username: account.username,
        password: account.passwordHash,
        darkMode: account.darkMode,
        permissions: [...account.permissions],
        genreRelevanceFilter: account.genreRelevanceFilter,
        showRelevanceTags: account.showRelevanceTags,
        showTypeTags: account.showTypeTags,
        showNsfw: account.showNsfw,
        updatedAt: account.updatedAt,
      })
      .where(eq(accounts.id, id))
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
