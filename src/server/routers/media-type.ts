import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { createMediaType, getMediaType, getMediaTypes } from '../db/media-type'
import { CreateMediaTypeInput } from '../db/media-type/inputs'
import { requirePermission } from '../guards'

export const mediaTypeRouter = createRouter()
  .mutation('add', {
    input: CreateMediaTypeInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASE_TYPES)
      return createMediaType(input)
    },
  })
  .query('all', { resolve: () => getMediaTypes() })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getMediaType(id),
  })
