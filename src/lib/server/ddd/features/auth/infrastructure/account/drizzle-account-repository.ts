import Postgres from 'postgres'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { accounts } from '$lib/server/db/schema'

import { Account } from '../../domain/account'
import { type AccountRepository, NonUniqueUsernameError } from './account-repository'

export class DrizzleAccountRepository implements AccountRepository {
  constructor(private db: IDrizzleConnection) {}

  async findByUsername(username: string): Promise<(Account & { id: number }) | undefined> {
    const entry = await this.db.query.accounts.findFirst({
      where: (accounts, { eq }) => eq(accounts.username, username),
    })
    if (!entry) return

    const account = new Account({
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

    return { ...account, id: entry.id }
  }

  async create(account: Account): Promise<number | NonUniqueUsernameError> {
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
      if (
        error instanceof Postgres.PostgresError &&
        error.code === '23505' &&
        error.constraint_name === 'Account_username_unique'
      ) {
        return new NonUniqueUsernameError(account.username)
      }
      throw error
    }
  }
}
