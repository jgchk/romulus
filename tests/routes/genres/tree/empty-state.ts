import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { CreateGenrePage } from '../../../fixtures/pages/genre-create'
import { createGenres, deleteGenres } from '../../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-genre-tree-empty-state',
  password: 'test-password-genre-tree-empty-state',
}

export default function emptyStateTests() {
  test.describe('empty state', () => {
    test.afterAll(async ({ dbConnection }) => {
      await deleteGenres(dbConnection)
    })

    test('when there are 0 genres and the user is not logged in, should show empty state', async ({
      genresPage,
      genreTree,
    }) => {
      await genresPage.goto()

      await expect(genreTree.emptyState).toBeVisible()
      await expect(genreTree.createGenreLink).not.toBeVisible()
    })

    test('when there are 0 genres and the user is logged in without EDIT_GENRES permission, should show empty state', async ({
      withAccount,
      signInPage,
      genresPage,
      genreTree,
    }) => {
      await withAccount(TEST_ACCOUNT)

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await genresPage.goto()

      await expect(genreTree.emptyState).toBeVisible()
      await expect(genreTree.createGenreLink).not.toBeVisible()
    })

    test('when there are 0 genres and the user is logged in with EDIT_GENRES permission, should show empty state with CTA to create a genre', async ({
      withAccount,
      signInPage,
      genreTree,
      page,
    }) => {
      await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await expect(genreTree.emptyState).toBeVisible()
      await expect(genreTree.createGenreLink).toBeVisible()
      await genreTree.createGenreLink.click()
      await expect(page).toHaveURL(CreateGenrePage.url)
    })

    test('when there is 1 genre', async ({ withAccount, dbConnection, genresPage, genreTree }) => {
      const account = await withAccount(TEST_ACCOUNT)
      await createGenres([{ name: 'Genre' }], account.id, dbConnection)

      await genresPage.goto()

      await expect(genreTree.emptyState).not.toBeVisible()
    })
  })
}
