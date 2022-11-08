import { createRouter } from '../createRouter'
import { accountRouter } from './account'
import { artistRouter } from './artist'
import { authRouter } from './auth'
import { genreRouter } from './genre'
import { genreHistoryRouter } from './genre-history'
import { genreRelevanceRouter } from './genre-relevance'
import { itemRouter } from './item'
import { mediaTypeRouter } from './media-type'
import { personRouter } from './person'
import { releaseRouter } from './release'
import { releaseTypeRouter } from './release-type'
import { schemaRouter } from './schema'
import { senseRouter } from './sense'
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
  .merge('schema.', schemaRouter)
  .merge('media.type.', mediaTypeRouter)
  .merge('sense.', senseRouter)

export type AppRouter = typeof appRouter
