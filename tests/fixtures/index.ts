import { test as base } from '@playwright/test'

import { GenreTree } from './elements/genre-tree'
import { ErrorPage } from './pages/error'
import { CreateGenrePage } from './pages/genre-create'
import { GenreDetailsPage } from './pages/genre-details'
import { EditGenrePage } from './pages/genre-edit'
import { GenreHistoryPage } from './pages/genre-history'
import { GenresPage } from './pages/genres'
import { SignInPage } from './pages/sign-in'
import { SignUpPage } from './pages/sign-up'

export const test = base
  .extend({
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
  .extend<{
    createGenrePage: CreateGenrePage
    editGenrePage: EditGenrePage
    errorPage: ErrorPage
    genresPage: GenresPage
    genrePage: GenreDetailsPage
    genreHistoryPage: GenreHistoryPage
    signInPage: SignInPage
    signUpPage: SignUpPage
  }>({
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
  .extend<{ genreTree: GenreTree }>({
    genreTree: async ({ page }, use) => {
      await use(new GenreTree(page))
    },
  })
