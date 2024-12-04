import { type Page, test as base } from '@playwright/test'

import { type IDrizzleConnection } from '$lib/server/db/connection'
import { getDbConnection, getPostgresConnection } from '$lib/server/db/connection/postgres'
import type { Account, Genre, InsertAccount } from '$lib/server/db/schema'
import * as schema from '$lib/server/db/schema'

import {
  createAccounts,
  createGenres,
  deleteAccounts,
  deleteGenres,
  type InsertTestGenre,
} from '../utils'
import { GenreTree } from './elements/genre-tree'
import { Navbar } from './elements/navbar'
import { ApiKeysPage } from './pages/api-keys'
import { ApiPlaygroundPage } from './pages/api-playground'
import { ErrorPage } from './pages/error'
import { CreateGenrePage } from './pages/genre-create'
import { GenreDetailsPage } from './pages/genre-details'
import { EditGenrePage } from './pages/genre-edit'
import { GenreHistoryPage } from './pages/genre-history'
import { GenresPage } from './pages/genres'
import { SignInPage } from './pages/sign-in'
import { SignUpPage } from './pages/sign-up'

export const test = base
  .extend<{ page: Page }>({
    page: async ({ page, javaScriptEnabled }, use) => {
      // automatically wait for kit started event after navigation functions if js is enabled
      const page_navigation_functions = ['goto', 'goBack', 'reload'] as const
      page_navigation_functions.forEach((fn) => {
        const page_fn = page[fn]
        if (!page_fn) {
          throw new Error(`function does not exist on page: ${fn}`)
        }
        // @ts-expect-error - we are dynamically adding a new function
        page[fn] = async function (...args: { wait_for_started: boolean }[]) {
          // @ts-expect-error - we are dynamically adding a new function
          const res = await page_fn.call(page, ...args)
          if (javaScriptEnabled && args[1]?.wait_for_started !== false) {
            await page.waitForSelector('body.started', { timeout: 5000 })
          }
          return res
        }
      })

      await use(page)
    },
  })
  .extend<{ dbConnection: IDrizzleConnection }>({
    // eslint-disable-next-line no-empty-pattern
    dbConnection: async ({}, use) => {
      const pg = getPostgresConnection()
      await use(getDbConnection(schema, pg))
      await pg.end()
    },
  })
  .extend<{
    withAccount: (account: InsertAccount) => Promise<Account>
  }>({
    withAccount: async ({ dbConnection }, use) => {
      const accounts: Account[] = []

      const withAccount = async (data: InsertAccount): Promise<Account> => {
        const [account] = await createAccounts([data], dbConnection)
        accounts.push(account)
        return account
      }

      await use(withAccount)

      await deleteAccounts(
        accounts.map((account) => account.username),
        dbConnection,
      )
    },
  })
  .extend<{
    withGenres: (genres: InsertTestGenre[], accountId: Account['id']) => Promise<Genre[]>
  }>({
    withGenres: async ({ dbConnection }, use) => {
      const genres: Genre[] = []

      const withGenre = async (
        data: InsertTestGenre[],
        accountId: Account['id'],
      ): Promise<Genre[]> => {
        const newGenres = await createGenres(data, accountId, dbConnection)
        genres.push(...newGenres)
        return newGenres
      }

      await use(withGenre)

      await deleteGenres(
        genres.map((genre) => genre.id),
        dbConnection,
      )
    },
  })
  .extend<{
    apiKeysPage: ApiKeysPage
    apiPlaygroundPage: ApiPlaygroundPage
    createGenrePage: CreateGenrePage
    editGenrePage: EditGenrePage
    errorPage: ErrorPage
    genresPage: GenresPage
    genrePage: GenreDetailsPage
    genreHistoryPage: GenreHistoryPage
    signInPage: SignInPage
    signUpPage: SignUpPage
  }>({
    apiKeysPage: async ({ page }, use) => {
      await use(new ApiKeysPage(page))
    },
    apiPlaygroundPage: async ({ page }, use) => {
      await use(new ApiPlaygroundPage(page))
    },
    createGenrePage: async ({ page }, use) => {
      await use(new CreateGenrePage(page))
    },
    editGenrePage: async ({ page }, use) => {
      await use(new EditGenrePage(page))
    },
    errorPage: async ({ page }, use) => {
      await use(new ErrorPage(page))
    },
    genresPage: async ({ page }, use) => {
      await use(new GenresPage(page))
    },
    genrePage: async ({ page }, use) => {
      await use(new GenreDetailsPage(page))
    },
    genreHistoryPage: async ({ page }, use) => {
      await use(new GenreHistoryPage(page))
    },
    signInPage: async ({ page }, use) => {
      await use(new SignInPage(page))
    },
    signUpPage: async ({ page }, use) => {
      await use(new SignUpPage(page))
    },
  })
  .extend<{ genreTree: GenreTree; navbar: Navbar }>({
    genreTree: async ({ page }, use) => {
      await use(new GenreTree(page))
    },
    navbar: async ({ page }, use) => {
      await use(new Navbar(page))
    },
  })
