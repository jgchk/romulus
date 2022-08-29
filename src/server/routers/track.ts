import { Permission } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import {
  createTrack,
  deleteTrack,
  editTrack,
  getTrack,
  getTracks,
} from '../db/track'
import {
  CreateTrackInput,
  DeleteTrackInput,
  EditTrackInput,
} from '../db/track/input'
import { requirePermission } from '../guards'

export const trackRouter = createRouter()
  .mutation('add', {
    input: CreateTrackInput,
    resolve: ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return createTrack(input, account.id)
    },
  })
  .query('all', {
    resolve: () => getTracks(),
  })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id } }) => {
      const track = await getTrack(id)

      if (!track) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No track with id '${id}'`,
        })
      }

      return track
    },
  })
  .mutation('edit', {
    input: EditTrackInput,
    resolve: ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return editTrack(input, account.id)
    },
  })
  .mutation('delete', {
    input: DeleteTrackInput,
    resolve: async ({ input: { id }, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return deleteTrack(id, account.id)
    },
  })
