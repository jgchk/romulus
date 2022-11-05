import { createRouter } from '../createRouter'
import { accountRouter } from './account'
import { artistRouter } from './artist'
import { authRouter } from './auth'
import { genreRouter } from './genre'
import { genreHistoryRouter } from './genre-history'
import { genreRelevanceRouter } from './genre-relevance'
import { itemRouter } from './item'
import { personRouter } from './person'
import { releaseRouter } from './release'
import { releaseTypeRouter } from './release-type'
import { songRouter } from './song'

export const appRouter = createRouter()
  .merge('account.', accountRouter)
  .merge('auth.', authRouter)
  .merge('genre.', genreRouter)
  .merge('genre.history.', genreHistoryRouter)
  .merge('genre.relevance.', genreRelevanceRouter)
  .merge('artist.', artistRouter)
  .merge('person.', personRouter)
  .merge('song.', songRouter)
  .merge('release.', releaseRouter)
  .merge('release.type.', releaseTypeRouter)
  .merge('item.', itemRouter)

export type AppRouter = typeof appRouter
