import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { GenreTreeGenre } from '../../../fixtures/elements/genre-tree'
import { createGenres, deleteGenres } from '../../../utils'

export default function expansionTests() {
  test.describe('expansion', () => {
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

      test('should not be expandable', async ({ genreTree }) => {
        await expect(
          new GenreTreeGenre(genreTree.genres.first()).expandCollapseButton,
        ).not.toBeVisible()
      })
    })

    test.describe('when there are 2 genres', () => {
      test.beforeAll(async () => {
        await createGenres([{ name: 'Parent' }, { name: 'Child', parents: ['Parent'] }])
      })

      test.afterAll(async () => {
        await deleteGenres()
      })

      test.beforeEach(async ({ genresPage }) => {
        await genresPage.goto()
      })

      test('only the parent genre should be expandable', async ({ genreTree }) => {
        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toHaveText('Parent')

        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()

        await expect(genreTree.genres).toHaveCount(2)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toHaveText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toHaveText('Child')
        await expect(
          new GenreTreeGenre(genreTree.genres.nth(1)).expandCollapseButton,
        ).not.toBeVisible()

        await new GenreTreeGenre(genreTree.genres.nth(0)).collapseButton.click()

        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toHaveText('Parent')
      })

      test('the parent genre should expand on click', async ({ genreTree }) => {
        await expect(genreTree.genres).toHaveCount(1)

        await new GenreTreeGenre(genreTree.genres.nth(0)).link.click()

        await expect(genreTree.genres).toHaveCount(2)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toHaveText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toHaveText('Child')
      })
    })

    test.describe('when there are 3 genres', () => {
      test.beforeAll(async () => {
        await createGenres([
          { name: 'Parent' },
          { name: 'Child', parents: ['Parent'] },
          { name: 'Grandchild', parents: ['Child'] },
        ])
      })

      test.afterAll(async () => {
        await deleteGenres()
      })

      test.beforeEach(async ({ genresPage }) => {
        await genresPage.goto()
      })

      test('only the parent and child genres should be expandable', async ({ genreTree }) => {
        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toHaveText('Parent')

        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()

        await expect(genreTree.genres).toHaveCount(2)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toHaveText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toHaveText('Child')

        await new GenreTreeGenre(genreTree.genres.nth(1)).expandButton.click()

        await expect(genreTree.genres).toHaveCount(3)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toHaveText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toHaveText('Child')
        await expect(new GenreTreeGenre(genreTree.genres.nth(2)).link).toHaveText('Grandchild')
        await expect(
          new GenreTreeGenre(genreTree.genres.nth(2)).expandCollapseButton,
        ).not.toBeVisible()

        await new GenreTreeGenre(genreTree.genres.nth(1)).collapseButton.click()

        await expect(genreTree.genres).toHaveCount(2)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toHaveText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toHaveText('Child')

        await new GenreTreeGenre(genreTree.genres.nth(0)).collapseButton.click()

        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toHaveText('Parent')
      })

      test('should expand and collapse entire subtrees', async ({ genreTree }) => {
        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()
        await new GenreTreeGenre(genreTree.genres.nth(1)).expandButton.click()
        await expect(genreTree.genres).toHaveCount(3)

        await new GenreTreeGenre(genreTree.genres.nth(0)).collapseButton.click()

        await expect(genreTree.genres).toHaveCount(1)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toHaveText('Parent')

        await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()

        await expect(genreTree.genres).toHaveCount(3)
        await expect(new GenreTreeGenre(genreTree.genres.nth(0)).link).toHaveText('Parent')
        await expect(new GenreTreeGenre(genreTree.genres.nth(1)).link).toHaveText('Child')
        await expect(new GenreTreeGenre(genreTree.genres.nth(2)).link).toHaveText('Grandchild')
      })
    })
  })
}
