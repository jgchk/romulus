import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import {
  createGenre,
  deleteGenre,
  editGenre,
  getGenre,
  getPaginatedGenres,
  getSimpleGenre,
  getTopLevelTreeGenres,
  getTreeGenreChildren,
  getTreeStructure,
  searchSimpleGenres,
} from '../db/genre'
import {
  CreateGenreInput,
  DeleteGenreInput,
  EditGenreInput,
  Sort,
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
  .query('paginated', {
    input: z.object({ page: z.number(), size: z.number(), sort: Sort.array() }),
    resolve: ({ input: { page, size, sort } }) =>
      getPaginatedGenres(page, size > 100 ? 100 : size, sort),
  })
  .query('tree.topLevel', {
    resolve: () => getTopLevelTreeGenres(),
  })
  .query('tree.children', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getTreeGenreChildren(id),
  })
  .query('tree.structure', {
    resolve: () => getTreeStructure(),
  })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getGenre(id),
  })
  .query('byId.simple', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getSimpleGenre(id),
  })
  .query('search.simple', {
    input: z.object({ query: z.string() }),
    resolve: ({ input: { query } }) => searchSimpleGenres(query),
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
