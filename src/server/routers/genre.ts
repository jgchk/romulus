import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import {
  createGenre,
  deleteGenre,
  editGenre,
  getGenre,
  getGenres,
  getSimpleGenre,
  getSimpleGenres,
  getTreeGenres,
} from '../db/genre'
import {
  CreateGenreInput,
  DeleteGenreInput,
  EditGenreInput,
} from '../db/genre/inputs'
import { requirePermission } from '../guards'

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
    resolve: () => getGenres(),
  })
  .query('all.simple', {
    resolve: () => getSimpleGenres(),
  })
  .query('all.tree', {
    resolve: () => getTreeGenres(),
  })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getGenre(id),
  })
  .query('byId.simple', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getSimpleGenre(id),
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
