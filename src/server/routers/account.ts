import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { defaultAccountSelect } from '../db/account'
import { prisma } from '../prisma'

export const accountRouter = createRouter()
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id } }) => {
      const account = await prisma.account.findUnique({
        where: { id },
        select: defaultAccountSelect,
      })

      if (!account) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No account with id '${id}'`,
        })
      }

      return account
    },
  })
  .query('all', {
    resolve: () => prisma.account.findMany({ select: defaultAccountSelect }),
  })
