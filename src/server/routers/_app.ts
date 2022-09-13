import { createRouter } from '../createRouter'
import { accountRouter } from './account'
import { artistRouter } from './artist'
import { artistHistoryRouter } from './artist-history'
import { authRouter } from './auth'
import { genreRouter } from './genre'
import { genreHistoryRouter } from './genre-history'
import { genreRelevanceRouter } from './genre-relevance'
import { issueRouter } from './issue'
import { issueHistoryRouter } from './issue-history'
import { objectRouter } from './object'
import { releaseRouter } from './release'
import { releaseHistoryRouter } from './release-history'
import { spotifyRouter } from './spotify'
import { trackRouter } from './track'

export const appRouter = createRouter()
  .merge('account.', accountRouter)
  .merge('auth.', authRouter)
  .merge('artist.', artistRouter)
  .merge('artist.history.', artistHistoryRouter)
  .merge('genre.', genreRouter)
  .merge('genre.history.', genreHistoryRouter)
  .merge('genre.relevance.', genreRelevanceRouter)
  .merge('release.', releaseRouter)
  .merge('release.history.', releaseHistoryRouter)
  .merge('issue.', issueRouter)
  .merge('issue.history.', issueHistoryRouter)
  .merge('object.', objectRouter)
  .merge('track.', trackRouter)
  .merge('spotify.', spotifyRouter)

export type AppRouter = typeof appRouter
