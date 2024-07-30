import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { GenreTreeGenre } from '../../../fixtures/elements/genre-tree'
import { createAccounts, createGenres, deleteAccounts, deleteGenres } from '../../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-genre-tree-expansion',
  password: 'test-password-genre-tree-expansion',
}

export default function expansionTests() {
  test.describe('expansion', () => {
    test.describe('when there is 1 genre', () => {
      test.beforeAll(async ({ dbConnection }) => {
        const [account] = await createAccounts([TEST_ACCOUNT], dbConnection)
        await createGenres([{ name: 'Genre' }], account.id, dbConnection)
      })

      test.afterAll(async ({ dbConnection }) => {
        await deleteAccounts([TEST_ACCOUNT.username], dbConnection)
        await deleteGenres(dbConnection)
      })

      test.beforeEach(async ({ genresPage }) => {
        await genresPage.goto()
      })

      test('should not be expandable', async ({ genreTree }) => {
        await expect(
          new GenreTreeGenre(genreTree.genres.first()).expandCollapseButton,
        ).not.toBeVisible()
      })

      test('should not show the collapse all button when a genre is selected', async ({
        genreTree,
      }) => {
        await new GenreTreeGenre(genreTree.genres.first()).link.click()
        await expect(genreTree.collapseAllButton).not.toBeVisible()
      })
    })

    test.describe('when there are 2 genres', () => {
      test.beforeAll(async ({ dbConnection }) => {
        const [account] = await createAccounts([TEST_ACCOUNT], dbConnection)
        await createGenres(
          [{ name: 'Parent' }, { name: 'Child', parents: ['Parent'] }],
          account.id,
          dbConnection,
        )
      })

      test.afterAll(async ({ dbConnection }) => {
        await deleteAccounts([TEST_ACCOUNT.username], dbConnection)
        await deleteGenres(dbConnection)
      })

      test.beforeEach(async ({ genresPage }) => {
        await genresPage.goto()
      })

      test('only the parent genre should be expandable', async ({ genreTree }) => {
        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')

        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()

        await expect(genreTree.genres).toHaveCount(2)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toContainText('Child')
        await expect(
          new GenreTreeGenre(genreTree.genres.nth(1)).expandCollapseButton,
        ).not.toBeVisible()

        await new GenreTreeGenre(genreTree.genres.nth(0)).collapseButton.click()

        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')
      })

      test('the parent genre should expand on click', async ({ genreTree }) => {
        await expect(genreTree.genres).toHaveCount(1)

        await new GenreTreeGenre(genreTree.genres.nth(0)).link.click()

        await expect(genreTree.genres).toHaveCount(2)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toContainText('Child')
      })

      test('the collapse all button should show when a genre is expanded', async ({
        genreTree,
      }) => {
        await expect(genreTree.collapseAllButton).not.toBeVisible()
        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()
        await expect(genreTree.collapseAllButton).toBeVisible()
        await new GenreTreeGenre(genreTree.genres.nth(0)).collapseButton.click()
        await expect(genreTree.collapseAllButton).not.toBeVisible()
      })

      test('clicking the collapse all button should collapse all genres', async ({ genreTree }) => {
        await expect(genreTree.genres).toHaveCount(1)
        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()
        await expect(genreTree.genres).toHaveCount(2)
        await genreTree.collapseAllButton.click()
        await expect(genreTree.genres).toHaveCount(1)
      })
    })

    test.describe('when there are 3 genres', () => {
      test.beforeAll(async ({ dbConnection }) => {
        const [account] = await createAccounts([TEST_ACCOUNT], dbConnection)
        await createGenres(
          [
            { name: 'Parent' },
            { name: 'Child', parents: ['Parent'] },
            { name: 'Grandchild', parents: ['Child'] },
          ],
          account.id,
          dbConnection,
        )
      })

      test.afterAll(async ({ dbConnection }) => {
        await deleteAccounts([TEST_ACCOUNT.username], dbConnection)
        await deleteGenres(dbConnection)
      })

      test.beforeEach(async ({ genresPage }) => {
        await genresPage.goto()
      })

      test('only the parent and child genres should be expandable', async ({ genreTree }) => {
        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')

        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()

        await expect(genreTree.genres).toHaveCount(2)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toContainText('Child')

        await new GenreTreeGenre(genreTree.genres.nth(1)).expandButton.click()

        await expect(genreTree.genres).toHaveCount(3)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toContainText('Child')
        await expect(new GenreTreeGenre(genreTree.genres.nth(2)).link).toContainText('Grandchild')
        await expect(
          new GenreTreeGenre(genreTree.genres.nth(2)).expandCollapseButton,
        ).not.toBeVisible()

        await new GenreTreeGenre(genreTree.genres.nth(1)).collapseButton.click()

        await expect(genreTree.genres).toHaveCount(2)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toContainText('Child')

        await new GenreTreeGenre(genreTree.genres.nth(0)).collapseButton.click()

        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')
      })

      test('should expand and collapse entire subtrees', async ({ genreTree }) => {
        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()
        await new GenreTreeGenre(genreTree.genres.nth(1)).expandButton.click()
        await expect(genreTree.genres).toHaveCount(3)

        await new GenreTreeGenre(genreTree.genres.nth(0)).collapseButton.click()

        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')

        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()

        await expect(genreTree.genres).toHaveCount(3)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toContainText('Child')
        await expect(new GenreTreeGenre(genreTree.genres.nth(2)).link).toContainText('Grandchild')
      })
    })
  })
}
