import { TRPCError } from '@trpc/server'
import { Context } from './context'

export const requireLogin = (ctx: Context) => {
  if (!ctx.account) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to use this endpoint',
    })
  }
}
