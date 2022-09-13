import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
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

export const genreRelevanceRouter = createRouter()
  .query('byGenreId', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id } }) => getByGenreId(id),
  })
  .query('byGenreIdForAccount', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input, ctx }) => {
      const { account } = requireLogin(ctx)
      return getByGenreIdForAccount(input.id, account.id)
    },
  })
  .mutation('vote', {
    input: GenreRelevanceVoteInput,
    resolve: async ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_GENRES)
      return setGenreRelevanceVote(input, account.id)
    },
  })
  .mutation('delete', {
    input: DeleteGenreRelevanceVoteInput,
    resolve: async ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_GENRES)
      return deleteGenreRelevanceVote(input, account.id)
    },
  })
