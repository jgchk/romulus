/**
 * This file contains the root router of your tRPC-backend
 */
import { createRouter } from '../createRouter'
import { accountRouter } from './account'
import { artistRouter } from './artist'
import { authRouter } from './auth'
import { genreRouter } from './genre'
import { genreHistoryRouter } from './genre-history'
import { releaseRouter } from './release'

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = createRouter()
  /**
   * Optionally do custom error (type safe!) formatting
   * @link https://trpc.io/docs/error-formatting
   */
  // .formatError(({ shape, error }) => { })
  .merge('account.', accountRouter)
  .merge('auth.', authRouter)
  .merge('artist.', artistRouter)
  .merge('genre.', genreRouter)
  .merge('genre.history.', genreHistoryRouter)
  .merge('release.', releaseRouter)

export type AppRouter = typeof appRouter
