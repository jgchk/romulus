import { TRPCError } from '@trpc/server'

import { Context } from './context'

type LoggedInContext = Omit<Context, 'account'> & {
  account: NonNullable<Context['account']>
}

const isLoggedInContext = (
  ctx: Context | LoggedInContext
): ctx is LoggedInContext => ctx.account !== null

export const requireLogin = (ctx: Context): LoggedInContext => {
  if (!isLoggedInContext(ctx)) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to use this endpoint',
    })
  }

  return ctx
}
