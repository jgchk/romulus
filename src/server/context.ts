import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'

import { getTokenFromApiRequest } from './authentication'
import { getAccountById } from './db/account'
import SessionManager from './session'

export type Context = trpc.inferAsyncReturnType<typeof createContext>

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const token = getTokenFromApiRequest(opts.req)

  if (!token) {
    return { token, session: null, account: null }
  }

  const session = await new SessionManager().getSession(token)
  if (!session) {
    return { token, session: null, account: null }
  }

  const account = await getAccountById(session.accountId)
  return { token, session, account }
}
