import { Permission } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { createArtist, deleteArtist, editArtist } from '../db/artist'
import {
  CreateArtistInput,
  DeleteArtistInput,
  EditArtistInput,
} from '../db/artist/input'
import { defaultArtistSelect, simpleArtistSelect } from '../db/artist/output'
import { requirePermission } from '../guards'
import { prisma } from '../prisma'

export const artistRouter = createRouter()
  .mutation('add', {
    input: CreateArtistInput,
    resolve: async ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_ARTISTS)
      return createArtist(input, account.id)
    },
  })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id } }) => {
      const artist = await prisma.artist.findUnique({
        where: { id },
        select: defaultArtistSelect,
      })

      if (!artist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No artist with id '${id}'`,
        })
      }

      return artist
    },
  })
  .query('all.simple', {
    resolve: () => prisma.artist.findMany({ select: simpleArtistSelect }),
  })
  .mutation('edit', {
    input: EditArtistInput,
    resolve: async ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_ARTISTS)
      return editArtist(input, account.id)
    },
  })
  .mutation('delete', {
    input: DeleteArtistInput,
    resolve: async ({ input: { id }, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_ARTISTS)
      return deleteArtist(id, account.id)
    },
  })
