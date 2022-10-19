import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import {
  createArtist,
  deleteArtist,
  editArtist,
  getArtist,
  getArtists,
} from '../db/artist'
import { CreateArtistInput, EditArtistInput } from '../db/artist/inputs'
import { requirePermission } from '../guards'

export const artistRouter = createRouter()
  .mutation('add', {
    input: CreateArtistInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return createArtist(input)
    },
  })
  .query('all', { resolve: () => getArtists() })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getArtist(id),
  })
  .mutation('edit', {
    input: EditArtistInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return editArtist(input)
    },
  })
  .mutation('delete', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id }, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return deleteArtist(id)
    },
  })
