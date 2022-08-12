import { Permission } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { createGenre, deleteGenre, editGenre } from '../db/genre'
import {
  CreateGenreInput,
  DeleteGenreInput,
  EditGenreInput,
} from '../db/genre/inputs'
import {
  defaultGenreSelect,
  simpleGenreSelect,
  treeGenreSelect,
} from '../db/genre/outputs'
import { requirePermission } from '../guards'
import { prisma } from '../prisma'

export const genreRouter = createRouter()
  // create
  .mutation('add', {
    input: CreateGenreInput,
    resolve: async ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_GENRES)
      return createGenre(input, account.id)
    },
  })
  // read
  .query('all', {
    resolve: () => prisma.genre.findMany({ select: defaultGenreSelect }),
  })
  .query('all.simple', {
    resolve: () => prisma.genre.findMany({ select: simpleGenreSelect }),
  })
  .query('all.tree', {
    resolve: () => prisma.genre.findMany({ select: treeGenreSelect }),
  })
  .query('byId', {
    input: z.object({
      id: z.number(),
    }),
    resolve: async ({ input: { id } }) => {
      const genre = await prisma.genre.findUnique({
        where: { id },
        select: defaultGenreSelect,
      })

      if (!genre) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No genre with id '${id}'`,
        })
      }

      return genre
    },
  })
  // update
  .mutation('edit', {
    input: EditGenreInput,
    resolve: async ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_GENRES)
      return editGenre(input, account.id)
    },
  })
  // delete
  .mutation('delete', {
    input: DeleteGenreInput,
    resolve: async ({ input: { id }, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_GENRES)
      return deleteGenre(id, account.id)
    },
  })
