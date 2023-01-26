import { Permission } from '@prisma/client'
import { z } from 'zod'

import {
  deleteGenreRelevanceVote,
  getByGenreId,
  getByGenreIdForAccount,
  setGenreRelevanceVote,
} from '../db/genre-relevance'
import {
  DeleteGenreRelevanceVoteInput,
  GenreRelevanceVoteInput,
} from '../db/genre-relevance/inputs'
import { requireLogin, requirePermission } from '../guards'
import { publicProcedure, router } from '../trpc'

export const genreRelevanceRouter = router({
  byGenreId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input: { id } }) => getByGenreId(id)),
  byGenreIdForAccount: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const { account } = requireLogin(ctx)
      return getByGenreIdForAccount(input.id, account.id)
    }),
  vote: publicProcedure
    .input(GenreRelevanceVoteInput)
    .mutation(async ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_GENRES)
      return setGenreRelevanceVote(input, account.id)
    }),
  delete: publicProcedure
    .input(DeleteGenreRelevanceVoteInput)
    .mutation(async ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_GENRES)
      return deleteGenreRelevanceVote(input, account.id)
    }),
})
