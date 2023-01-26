import { router } from '../trpc'
import { accountRouter } from './account'
import { artistRouter } from './artist'
import { authRouter } from './auth'
import { genreRouter } from './genre'
import { personRouter } from './person'

export const appRouter = router({
  account: accountRouter,
  auth: authRouter,
  genre: genreRouter,
  artist: artistRouter,
  person: personRouter,
})

export type AppRouter = typeof appRouter
