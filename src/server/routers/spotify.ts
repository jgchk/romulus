import { z } from 'zod'

import { nonemptyString } from '../../utils/validators'
import { createRouter } from '../createRouter'
import { requireLogin } from '../guards'
import { getAlbum, getArtist } from '../services/spotify'

export const spotifyRouter = createRouter()
  .query('album', {
    input: z.object({ id: nonemptyString() }),
    resolve: async ({ input: { id }, ctx }) => {
      requireLogin(ctx)
      return getAlbum(id)
    },
  })
  .query('artist', {
    input: z.object({ id: nonemptyString() }),
    resolve: async ({ input: { id }, ctx }) => {
      requireLogin(ctx)
      return getArtist(id)
    },
  })
