import { expect } from '@playwright/test'

import { test } from '../../fixtures'
import { CreateGenrePage } from '../../fixtures/pages/genre-create'
import { GenresPage } from '../../fixtures/pages/genres'
import { createAccounts, createGenres, deleteAccounts, deleteGenres } from '../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-genres',
  password: 'test-password-genres',
}

test.describe('when user is not logged in', () => {
  test.beforeEach(async ({ genresPage }) => {
    await genresPage.goto()
  })

  test('should not show genre settings button', async ({ genresPage }) => {
    await expect(genresPage.navigator.settingsButton).not.toBeVisible()
  })

  test.describe('when there are no existing genres', () => {
    test('should show empty state', async ({ genresPage }) => {
      await expect(genresPage.navigator.tree.emptyState).toBeVisible()
      await expect(genresPage.navigator.tree.createGenreLink).not.toBeVisible()
    })

    test('should show empty state when searching', async ({ genresPage }) => {
      await genresPage.navigator.search.input.fill('a')
      await expect(genresPage.navigator.tree.emptyState).toBeVisible()
      await expect(genresPage.navigator.tree.createGenreLink).not.toBeVisible()
    })
  })

  test.describe('when there are existing genres', () => {
    test.beforeAll(async () => {
      await createGenres()
    })

    test.afterAll(async () => {
      await deleteGenres()
    })

    test('should show genre links in tree', async ({ genresPage }) => {
      await expect(genresPage.navigator.tree.genreLinks).toHaveCount(2, { timeout: 20 * 1000 })
    })
  })
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
      await signInPage.page.waitForURL(GenresPage.url)
    })

    test('should show genre settings button', async ({ genresPage }) => {
      await expect(genresPage.navigator.settingsButton).toBeVisible()
    })

    test.describe('when there are no existing genres', () => {
      test('should show empty state', async ({ genresPage }) => {
        await expect(genresPage.navigator.tree.emptyState).toBeVisible()
        await expect(genresPage.navigator.tree.createGenreLink).not.toBeVisible()
      })

      test('should show empty state when searching', async ({ genresPage }) => {
        await genresPage.navigator.search.input.fill('a')
        await expect(genresPage.navigator.tree.emptyState).toBeVisible()
        await expect(genresPage.navigator.tree.createGenreLink).not.toBeVisible()
      })
    })

    test.describe('when there are existing genres', () => {
      test.beforeAll(async () => {
        await createGenres()
      })

      test.afterAll(async () => {
        await deleteGenres()
      })

      test('should show genre links in tree', async ({ genresPage }) => {
        await expect(genresPage.navigator.tree.genreLinks).toHaveCount(2, { timeout: 20 * 1000 })
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
      await signInPage.page.waitForURL(GenresPage.url)
    })

    test('should show genre settings button', async ({ genresPage }) => {
      await expect(genresPage.navigator.settingsButton).toBeVisible()
    })

    test.describe('when there are no existing genres', () => {
      test('should show empty state with CTA to create a genre', async ({ genresPage }) => {
        await expect(genresPage.navigator.tree.emptyState).toBeVisible()
        await expect(genresPage.navigator.tree.createGenreLink).toBeVisible()
        await genresPage.navigator.tree.createGenreLink.click()
        await expect(genresPage.page).toHaveURL(CreateGenrePage.url)
      })

      test('should show empty state when searching with CTA to create a genre', async ({
        genresPage,
      }) => {
        await genresPage.navigator.search.input.fill('a')
        await expect(genresPage.navigator.tree.emptyState).toBeVisible()
        await expect(genresPage.navigator.tree.createGenreLink).toBeVisible()
        await genresPage.navigator.tree.createGenreLink.click()
        await expect(genresPage.page).toHaveURL(CreateGenrePage.url)
      })
    })

    test.describe('when there are existing genres', () => {
      test.beforeAll(async () => {
        await createGenres()
      })

      test.afterAll(async () => {
        await deleteGenres()
      })

      test('should show genre links in tree', async ({ genresPage }) => {
        await expect(genresPage.navigator.tree.genreLinks).toHaveCount(2, { timeout: 20 * 1000 })
      })
    })
  })
})
