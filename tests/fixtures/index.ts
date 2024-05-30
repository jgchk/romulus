import { test as base } from '@playwright/test'

import { GenresPage } from './pages/genres'
import { SignInPage } from './pages/sign-in'
import { SignUpPage } from './pages/sign-up'

export const test = base
  .extend({
    page: async ({ page, javaScriptEnabled }, use) => {
      // automatically wait for kit started event after navigation functions if js is enabled
      const page_navigation_functions = ['goto', 'goBack', 'reload']
      page_navigation_functions.forEach((fn) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const page_fn = page[fn]
        if (!page_fn) {
          throw new Error(`function does not exist on page: ${fn}`)
        }
        page[fn] = async function (...args: { wait_for_started: boolean }[]) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const res = await page_fn.call(page, ...args)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (javaScriptEnabled && args[1]?.wait_for_started !== false) {
            await page.waitForSelector('body.started', { timeout: 5000 })
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return res
        }
      })

      await use(page)
    },
  })
  .extend<{ genresPage: GenresPage; signInPage: SignInPage; signUpPage: SignUpPage }>({
    genresPage: async ({ page }, use) => {
      await use(new GenresPage(page))
    },
    signInPage: async ({ page }, use) => {
      await use(new SignInPage(page))
    },
    signUpPage: async ({ page }, use) => {
      await use(new SignUpPage(page))
    },
  })
