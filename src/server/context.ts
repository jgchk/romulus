import * as trpcNext from '@trpc/server/adapters/next'
import { IronSessionData } from 'iron-session'

export type Context = {
  account: IronSessionData['account'] | undefined
}

export function createContext(
  opts: trpcNext.CreateNextContextOptions
): Context {
  const account = opts.req.session.account
  return { account }
}
