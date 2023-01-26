import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import {
  editAccount,
  getAccountById,
  getAccountByUsername,
} from '../db/account'
import { EditAccountInput } from '../db/account/inputs'
import { defaultAccountSelect } from '../db/account/outputs'
import { requireLogin } from '../guards'
import { prisma } from '../prisma'
import { publicProcedure, router } from '../trpc'

export const accountRouter = router({
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input: { id } }) => {
      const account = await getAccountById(id)

      if (!account) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No account with id '${id}'`,
        })
      }

      return account
    }),
  byUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input: { username } }) => getAccountByUsername(username)),
  edit: publicProcedure
    .input(EditAccountInput)
    .mutation(async ({ input, ctx }) => {
      const { account } = requireLogin(ctx)
      if (input.id !== account.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: "Cannot edit another member's account",
        })
      }
      return editAccount(input)
    }),
  all: publicProcedure.query(() =>
    prisma.account.findMany({ select: defaultAccountSelect })
  ),
})
