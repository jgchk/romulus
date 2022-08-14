import { createRouter } from '../createRouter'
import { accountRouter } from './account'
import { artistRouter } from './artist'
import { artistHistoryRouter } from './artist-history'
import { authRouter } from './auth'
import { genreRouter } from './genre'
import { genreHistoryRouter } from './genre-history'
import { issueRouter } from './issue'
import { issueHistoryRouter } from './issue-history'
import { releaseRouter } from './release'
import { releaseHistoryRouter } from './release-history'
import { spotifyRouter } from './spotify'

export const appRouter = createRouter()
  .merge('account.', accountRouter)
  .merge('auth.', authRouter)
  .merge('artist.', artistRouter)
  .merge('artist.history.', artistHistoryRouter)
  .merge('genre.', genreRouter)
  .merge('genre.history.', genreHistoryRouter)
  .merge('issue.', issueRouter)
  .merge('issue.history.', issueHistoryRouter)
  .merge('release.', releaseRouter)
  .merge('release.history.', releaseHistoryRouter)
  .merge('spotify.', spotifyRouter)

export type AppRouter = typeof appRouter
