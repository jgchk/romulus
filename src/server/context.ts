import * as trpcNext from '@trpc/server/adapters/next'

import { getAccountById } from './db/account'
import { DefaultAccount } from './db/account/outputs'

export type Context = {
  account: DefaultAccount | null
}

export async function createContext(
  opts: trpcNext.CreateNextContextOptions
): Promise<Context> {
  const accountId = opts.req.session.accountId

  const account =
    accountId !== undefined ? await getAccountById(accountId) : null

  return { account }
}
