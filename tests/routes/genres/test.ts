import { expect } from '@playwright/test'
import { eq } from 'drizzle-orm'

import { hashPassword } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts } from '$lib/server/db/schema'

import { test } from '../../fixtures'
import { CreateGenrePage } from '../../fixtures/pages/genre-create'
import { GenresPage } from '../../fixtures/pages/genres'

const TEST_ACCOUNT = {
  username: 'test-username-genres',
  password: 'test-password-genres',
}

test.describe('when user is not logged in', () => {
  test.beforeEach(async ({ genresPage }) => {
    await genresPage.goto()
  })

  test.describe('when there are no existing genres', () => {})

  test.describe('when there are existing genres', () => {})
})

test.describe('when user is logged in', () => {
  test.describe('without EDIT_GENRE permission', () => {
    test.beforeAll(async () => {
      await db.insert(accounts).values({
        username: TEST_ACCOUNT.username,
        password: await hashPassword(TEST_ACCOUNT.password),
      })
    })

    test.afterAll(async () => {
      await db.delete(accounts).where(eq(accounts.username, TEST_ACCOUNT.username))
    })

    test.beforeEach(async ({ signInPage }) => {
      await signInPage.goto()
      await signInPage.usernameInput.fill(TEST_ACCOUNT.username)
      await signInPage.passwordInput.fill(TEST_ACCOUNT.password)
      await signInPage.submitButton.click()
      await signInPage.page.waitForURL(GenresPage.url)
    })

    test.describe('when there are no existing genres', () => {
      test('should show empty state', async ({ genresPage }) => {
        await expect(genresPage.navigator.tree.emptyState).toBeVisible()
      })
    })
  })

  test.describe('with EDIT_GENRES permission', () => {
    test.beforeAll(async () => {
      await db.insert(accounts).values({
        username: TEST_ACCOUNT.username,
        password: await hashPassword(TEST_ACCOUNT.password),
        permissions: ['EDIT_GENRES'],
      })
    })

    test.afterAll(async () => {
      await db.delete(accounts).where(eq(accounts.username, TEST_ACCOUNT.username))
    })

    test.beforeEach(async ({ signInPage }) => {
      await signInPage.goto()
      await signInPage.usernameInput.fill(TEST_ACCOUNT.username)
      await signInPage.passwordInput.fill(TEST_ACCOUNT.password)
      await signInPage.submitButton.click()
      await signInPage.page.waitForURL(GenresPage.url)
    })

    test.describe('when there are no existing genres', () => {
      test('should show empty state with CTA to create a genre', async ({ genresPage }) => {
        await expect(genresPage.navigator.tree.emptyState).toBeVisible()
        await expect(genresPage.navigator.tree.createGenreLink).toBeVisible()
        await genresPage.navigator.tree.createGenreLink.click()
        await expect(genresPage.page).toHaveURL(CreateGenrePage.url)
      })
    })
  })
})
