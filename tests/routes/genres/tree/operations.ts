import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { GenreTreeGenre } from '../../../fixtures/elements/genre-tree'
import { GenreDetailsPage } from '../../../fixtures/pages/genre-details'
import {
  createAccounts,
  type CreatedGenre,
  createGenres,
  deleteAccounts,
  deleteGenres,
} from '../../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-genre-tree-operations',
  password: 'test-password-genre-tree-operations',
}

export default function operationsTests() {
  test.describe('operations', () => {
    test.describe('when there are 0 genres', () => {
      test.beforeAll(async () => {
        await createAccounts([{ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] }])
      })

      test.afterAll(async ({ dbConnection }) => {
        await deleteAccounts([TEST_ACCOUNT.username])
        await deleteGenres(dbConnection)
      })

      test.beforeEach(async ({ signInPage }) => {
        await signInPage.goto()
        await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
      })

      test('should update with new genre upon creation', async ({
        genreTree,
        genresPage,
        createGenrePage,
      }) => {
        await expect(genreTree.genres).toHaveCount(0)

        await genresPage.navigator.createGenreButton.click()
        await createGenrePage.createGenre({ name: 'Genre', type: 'STYLE' })

        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.first()).name).toHaveText('Genre')
      })
    })

    test.describe('when there is 1 genre', () => {
      let genre: CreatedGenre

      test.beforeAll(async () => {
        await createAccounts([
          {
            ...TEST_ACCOUNT,
            permissions: ['EDIT_GENRES'],
            showTypeTags: true,
            showRelevanceTags: true,
          },
        ])
      })

      test.afterAll(async () => {
        await deleteAccounts([TEST_ACCOUNT.username])
      })

      test.beforeEach(async ({ signInPage, dbConnection }) => {
        ;[genre] = await createGenres([{ name: 'Genre', type: 'STYLE' }], dbConnection)

        await signInPage.goto()
        await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
      })

      test.afterEach(async ({ dbConnection }) => {
        await deleteGenres(dbConnection)
      })

      test('should update genre name upon edit', async ({
        genreTree,
        genrePage,
        editGenrePage,
      }) => {
        await expect(new GenreTreeGenre(genreTree.genres.first()).name).toHaveText('Genre')
        await new GenreTreeGenre(genreTree.genres.first()).link.click()
        await genrePage.editButton.click()
        await editGenrePage.editGenre({ name: 'New Genre' })
        await expect(new GenreTreeGenre(genreTree.genres.first()).name).toHaveText('New Genre')
      })

      test('should update subtitle upon edit', async ({ genreTree, genrePage, editGenrePage }) => {
        await expect(new GenreTreeGenre(genreTree.genres.first()).subtitle).not.toBeVisible()
        await new GenreTreeGenre(genreTree.genres.first()).link.click()
        await genrePage.editButton.click()
        await editGenrePage.editGenre({ subtitle: 'New subtitle' })
        await expect(new GenreTreeGenre(genreTree.genres.first()).subtitle).toBeVisible()
      })

      test('should update type chip upon edit', async ({ genreTree, genrePage, editGenrePage }) => {
        await expect(new GenreTreeGenre(genreTree.genres.first()).typeChip).not.toBeVisible()
        await new GenreTreeGenre(genreTree.genres.first()).link.click()
        await genrePage.editButton.click()
        await editGenrePage.editGenre({ type: 'TREND' })
        await expect(new GenreTreeGenre(genreTree.genres.first()).typeChip).toBeVisible()
        await expect(new GenreTreeGenre(genreTree.genres.first()).typeChip).toHaveText('Trend')
      })

      test('should update relevance upon vote', async ({ genreTree, genrePage }) => {
        await expect(new GenreTreeGenre(genreTree.genres.first()).relevanceChip).toBeVisible()
        await expect(new GenreTreeGenre(genreTree.genres.first()).relevanceChip).toHaveText('?')
        await new GenreTreeGenre(genreTree.genres.first()).link.click()
        await genrePage.page.waitForURL(GenreDetailsPage.url(genre.id))
        await genrePage.vote(5)
        await expect(new GenreTreeGenre(genreTree.genres.first()).relevanceChip).toBeVisible()
        await expect(new GenreTreeGenre(genreTree.genres.first()).relevanceChip).toHaveText('5')
      })

      test('should show empty state upon deletion', async ({ genreTree, genrePage }) => {
        await expect(genreTree.genres).toHaveCount(1)
        await expect(genreTree.emptyState).not.toBeVisible()
        await new GenreTreeGenre(genreTree.genres.first()).link.click()
        await genrePage.delete()
        await expect(genreTree.emptyState).toBeVisible()
      })
    })

    test.describe('when there are 2 genres', () => {
      test.beforeAll(async () => {
        await createAccounts([{ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] }])
      })

      test.afterAll(async () => {
        await deleteAccounts([TEST_ACCOUNT.username])
      })

      test.beforeEach(async ({ signInPage, dbConnection }) => {
        await createGenres(
          [{ name: 'Parent' }, { name: 'Child', parents: ['Parent'] }],
          dbConnection,
        )

        await signInPage.goto()
        await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
      })

      test.afterEach(async ({ dbConnection }) => {
        await deleteGenres(dbConnection)
      })

      test('should move child to root level when deleting parent genre', async ({
        genreTree,
        genrePage,
      }) => {
        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()

        await expect(genreTree.genres).toHaveCount(2)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).name).toHaveText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).name).toHaveText('Child')

        await new GenreTreeGenre(genreTree.genres.nth(0)).link.click()

        await genrePage.delete()

        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).name).toHaveText('Child')
      })
    })

    test.describe('when there are 3 genres', () => {
      test.beforeAll(async () => {
        await createAccounts([{ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] }])
      })

      test.afterAll(async () => {
        await deleteAccounts([TEST_ACCOUNT.username])
      })

      test.beforeEach(async ({ signInPage, dbConnection }) => {
        await createGenres(
          [
            { name: 'Parent' },
            { name: 'Child', parents: ['Parent'] },
            { name: 'Grandchild', parents: ['Child'] },
          ],
          dbConnection,
        )

        await signInPage.goto()
        await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
      })

      test.afterEach(async ({ dbConnection }) => {
        await deleteGenres(dbConnection)
      })

      test('should move grandchild under parent when deleting child genre', async ({
        genreTree,
        genrePage,
      }) => {
        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()
        await new GenreTreeGenre(genreTree.genres.nth(1)).expandButton.click()

        await expect(genreTree.genres).toHaveCount(3)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).name).toHaveText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).name).toHaveText('Child')
        await expect(new GenreTreeGenre(genreTree.genres.nth(2)).name).toHaveText('Grandchild')

        await new GenreTreeGenre(genreTree.genres.nth(1)).link.click()

        await genrePage.delete()

        await expect(genreTree.genres).toHaveCount(2)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).name).toHaveText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).name).toHaveText('Grandchild')
      })
    })
  })
}
