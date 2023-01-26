import { Permission } from '@prisma/client'
import { z } from 'zod'

import {
  createArtist,
  deleteArtist,
  editArtist,
  getArtist,
  getArtists,
} from '../db/artist'
import { CreateArtistInput, EditArtistInput } from '../db/artist/inputs'
import { requirePermission } from '../guards'
import { publicProcedure, router } from '../trpc'

export const artistRouter = router({
  add: publicProcedure
    .input(CreateArtistInput)
    .mutation(async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return createArtist(input)
    }),
  all: publicProcedure.query(() => getArtists()),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input: { id } }) => getArtist(id)),
  edit: publicProcedure
    .input(EditArtistInput)
    .mutation(async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return editArtist(input)
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input: { id }, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return deleteArtist(id)
    }),
})
