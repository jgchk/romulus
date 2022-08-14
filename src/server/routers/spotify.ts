import { z } from 'zod'

import { createRouter } from '../createRouter'
import { requireLogin } from '../guards'
import { getAlbum, getArtist } from '../services/spotify'

export const spotifyRouter = createRouter()
  .query('album', {
    input: z.object({ id: z.string().trim().min(1) }),
    resolve: async ({ input: { id }, ctx }) => {
      requireLogin(ctx)
      return getAlbum(id)
    },
  })
  .query('artist', {
    input: z.object({ id: z.string().trim().min(1) }),
    resolve: async ({ input: { id }, ctx }) => {
      requireLogin(ctx)
      return getArtist(id)
    },
  })
