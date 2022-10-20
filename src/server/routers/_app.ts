import { createRouter } from '../createRouter'
import { accountRouter } from './account'
import { artistRouter } from './artist'
import { authRouter } from './auth'
import { conceptRouter } from './concept'
import { genreRouter } from './genre'
import { genreHistoryRouter } from './genre-history'
import { genreRelevanceRouter } from './genre-relevance'
import { itemRouter } from './item'
import { personRouter } from './person'
import { unitRouter } from './unit'

export const appRouter = createRouter()
  .merge('account.', accountRouter)
  .merge('auth.', authRouter)
  .merge('genre.', genreRouter)
  .merge('genre.history.', genreHistoryRouter)
  .merge('genre.relevance.', genreRelevanceRouter)
  .merge('artist.', artistRouter)
  .merge('person.', personRouter)
  .merge('unit.', unitRouter)
  .merge('concept.', conceptRouter)
  .merge('item.', itemRouter)

export type AppRouter = typeof appRouter
