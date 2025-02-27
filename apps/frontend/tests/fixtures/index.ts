import { type Page, test as base } from '@playwright/test'
import { AuthenticationClient } from '@romulus/authentication/client'

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

export async function deleteAccount(
  signInPage: SignInPage,
  account: { username: string; password: string },
) {
  const authSessionCookie = await ensureAuthSessionCookie(signInPage, account)

  const client = new AuthenticationClient({
    baseUrl: `http://localhost:3000/authentication`,
    sessionToken: authSessionCookie.value,
  })
  const whoami = await client.whoami()
  if (whoami.isErr()) throw whoami.error
  const id = whoami.value.account.id

  const deleteAccount = await client.deleteAccount(id)
  if (deleteAccount.isErr()) throw deleteAccount.error
}

async function ensureAuthSessionCookie(
  signInPage: SignInPage,
  account: { username: string; password: string },
) {
  let authSessionCookie = await getAuthSessionCookie(signInPage)
  if (authSessionCookie !== undefined) return authSessionCookie

  await signInPage.goto()
  await signInPage.signIn(account.username, account.password)

  authSessionCookie = await getAuthSessionCookie(signInPage)
  if (authSessionCookie === undefined) throw new Error('auth_session cookie not found')
  return authSessionCookie
}

async function getAuthSessionCookie(signInPage: SignInPage) {
  const cookies = await signInPage.page.context().cookies()
  const authSessionCookie = cookies.find((cookie) => cookie.name === 'auth_session')
  return authSessionCookie
}

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
  .extend<{
    cleanup: (fn: () => Promise<void>) => void
  }>({
    // eslint-disable-next-line no-empty-pattern
    cleanup: async ({}, use) => {
      const cleanupFunctions: (() => Promise<void>)[] = []

      const addCleanupFunction = (fn: () => Promise<void>) => {
        cleanupFunctions.push(fn)
      }

      await use(addCleanupFunction)

      cleanupFunctions.reverse()
      for (const cleanupFunction of cleanupFunctions) {
        await cleanupFunction()
      }
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
