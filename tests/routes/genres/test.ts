import { expect } from '@playwright/test'

import { test } from '../../fixtures'
import { CreateGenrePage } from '../../fixtures/pages/genre-create'
import { createAccounts, deleteAccounts } from '../../utils'

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
      await createAccounts([TEST_ACCOUNT])
    })

    test.afterAll(async () => {
      await deleteAccounts([TEST_ACCOUNT.username])
    })

    test.beforeEach(async ({ signInPage }) => {
      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
    })

    test.describe('when there are no existing genres', () => {
      test('should show empty state', async ({ genresPage }) => {
        await expect(genresPage.navigator.tree.emptyState).toBeVisible()
      })
    })
  })

  test.describe('with EDIT_GENRES permission', () => {
    test.beforeAll(async () => {
      await createAccounts([{ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] }])
    })

    test.afterAll(async () => {
      await deleteAccounts([TEST_ACCOUNT.username])
    })

    test.beforeEach(async ({ signInPage }) => {
      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
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
