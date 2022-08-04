import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { getTokenFromCookie } from './authentication'
import { getAccountById } from './db/account'
import SessionManager from './session'

export type Context = trpc.inferAsyncReturnType<typeof createContext>

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const token = getTokenFromCookie(opts.req)

  if (!token) {
    return { token }
  }

  const session = await new SessionManager().getSession(token)
  const account = await getAccountById(session.accountId)

  return { token, session, account }
}
