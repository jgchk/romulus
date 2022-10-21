import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { createSong, deleteSong, editSong, getSong, getSongs } from '../db/song'
import { CreateSongInput, EditSongInput } from '../db/song/inputs'
import { requirePermission } from '../guards'

export const songRouter = createRouter()
  .mutation('add', {
    input: CreateSongInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return createSong(input)
    },
  })
  .query('all', { resolve: () => getSongs() })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getSong(id),
  })
  .mutation('edit', {
    input: EditSongInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return editSong(input)
    },
  })
  .mutation('delete', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id }, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return deleteSong(id)
    },
  })
