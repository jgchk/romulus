import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { CreateGenrePage } from '../../../fixtures/pages/genre-create'
import { createAccounts, createGenres, deleteAccounts, deleteGenres } from '../../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-genre-tree-empty-state',
  password: 'test-password-genre-tree-empty-state',
}

export default function emptyStateTests() {
  test.describe('empty state', () => {
    test.describe('when there are 0 genres', () => {
      test.describe('when user is not logged in', () => {
        test.beforeEach(async ({ genresPage }) => {
          await genresPage.goto()
        })

        test('should show empty state', async ({ genreTree }) => {
          await expect(genreTree.emptyState).toBeVisible()
          await expect(genreTree.createGenreLink).not.toBeVisible()
        })
      })

      test.describe('when user is logged in', () => {
        test.describe('without EDIT_GENRES permission', () => {
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

          test('should show empty state', async ({ genreTree }) => {
            await expect(genreTree.emptyState).toBeVisible()
            await expect(genreTree.createGenreLink).not.toBeVisible()
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

          test('should show empty state with CTA to create a genre', async ({
            page,
            genreTree,
          }) => {
            await expect(genreTree.emptyState).toBeVisible()
            await expect(genreTree.createGenreLink).toBeVisible()
            await genreTree.createGenreLink.click()
            await expect(page).toHaveURL(CreateGenrePage.url)
          })
        })
      })
    })

    test.describe('when there is 1 genre', () => {
      test.beforeAll(async () => {
        await createGenres([{ name: 'Genre' }])
      })

      test.afterAll(async () => {
        await deleteGenres()
      })

      test.beforeEach(async ({ genresPage }) => {
        await genresPage.goto()
      })

      test('should not show empty state', async ({ genreTree }) => {
        await expect(genreTree.emptyState).not.toBeVisible()
      })
    })
  })
}
