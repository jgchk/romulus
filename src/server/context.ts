/* eslint-disable @typescript-eslint/no-unused-vars */
import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { getTokenFromCookie } from './authentication'

export type Context = trpc.inferAsyncReturnType<typeof createContext>

export function createContext(opts: trpcNext.CreateNextContextOptions) {
  const token = getTokenFromCookie(opts.req)
  return { token }
}
