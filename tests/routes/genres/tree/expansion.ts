import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { GenreTreeGenre } from '../../../fixtures/elements/genre-tree'

const TEST_ACCOUNT = {
  username: 'test-username-genre-tree-expansion',
  password: 'test-password-genre-tree-expansion',
}

export default function expansionTests() {
  test.describe('expansion', () => {
    test('when there is 1 genre, should not be expandable', async ({
      withAccount,
      withGenres,
      genresPage,
      genreTree,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      await withGenres([{ name: 'Genre' }], account.id)

      await genresPage.goto()

      await expect(
        new GenreTreeGenre(genreTree.genres.first()).expandCollapseButton,
      ).not.toBeVisible()
    })

    test('when there is 1 genre, should not show the collapse all button when a genre is selected', async ({
      withAccount,
      withGenres,
      genresPage,
      genreTree,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      await withGenres([{ name: 'Genre' }], account.id)

      await genresPage.goto()

      await expect(
        new GenreTreeGenre(genreTree.genres.first()).expandCollapseButton,
      ).not.toBeVisible()
    })

    test('when there are 2 genres, only the parent genre should be expandable', async ({
      withAccount,
      withGenres,
      genresPage,
      genreTree,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      await withGenres([{ name: 'Parent' }, { name: 'Child', parents: ['Parent'] }], account.id)

      await genresPage.goto()

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

    test('when there are 2 genres, the parent genre should expand on click', async ({
      withAccount,
      withGenres,
      genresPage,
      genreTree,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      await withGenres([{ name: 'Parent' }, { name: 'Child', parents: ['Parent'] }], account.id)

      await genresPage.goto()

      await expect(genreTree.genres).toHaveCount(1)

      await new GenreTreeGenre(genreTree.genres.nth(0)).link.click()

      await expect(genreTree.genres).toHaveCount(2)
      await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toContainText('Parent')
      await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toContainText('Child')
    })

    test('when there are 2 genres, the collapse all button should show when a genre is expanded', async ({
      withAccount,
      withGenres,
      genresPage,
      genreTree,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      await withGenres([{ name: 'Parent' }, { name: 'Child', parents: ['Parent'] }], account.id)

      await genresPage.goto()

      await expect(genreTree.collapseAllButton).not.toBeVisible()
      await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()
      await expect(genreTree.collapseAllButton).toBeVisible()
      await new GenreTreeGenre(genreTree.genres.nth(0)).collapseButton.click()
      await expect(genreTree.collapseAllButton).not.toBeVisible()
    })

    test('when there are 2 genres, clicking the collapse all button should collapse all genres', async ({
      withAccount,
      withGenres,
      genresPage,
      genreTree,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      await withGenres([{ name: 'Parent' }, { name: 'Child', parents: ['Parent'] }], account.id)

      await genresPage.goto()

      await expect(genreTree.genres).toHaveCount(1)
      await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()
      await expect(genreTree.genres).toHaveCount(2)
      await genreTree.collapseAllButton.click()
      await expect(genreTree.genres).toHaveCount(1)
    })

    test('when there are 3 genres, only the parent and child genres should be expandable', async ({
      withAccount,
      withGenres,
      genresPage,
      genreTree,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      await withGenres(
        [
          { name: 'Parent' },
          { name: 'Child', parents: ['Parent'] },
          { name: 'Grandchild', parents: ['Child'] },
        ],
        account.id,
      )

      await genresPage.goto()

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

    test('when there are 3 genres, should expand and collapse entire subtrees', async ({
      withAccount,
      withGenres,
      genresPage,
      genreTree,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      await withGenres(
        [
          { name: 'Parent' },
          { name: 'Child', parents: ['Parent'] },
          { name: 'Grandchild', parents: ['Child'] },
        ],
        account.id,
      )

      await genresPage.goto()

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
}
