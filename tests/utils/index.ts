import { inArray, InferInsertModel } from 'drizzle-orm'

import { hashPassword } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts } from '$lib/server/db/schema'

export const createAccounts = async (accounts_: InferInsertModel<typeof accounts>[]) => {
  const hashedAccounts = await Promise.all(
    accounts_.map(async (account) => ({
      ...account,
      password: await hashPassword(account.password),
    })),
  )

  await db.insert(accounts).values(hashedAccounts)
}

export const deleteAccounts = async (usernames: string[]) => {
  await db.delete(accounts).where(inArray(accounts.username, usernames))
}
