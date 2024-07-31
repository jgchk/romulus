import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { GenreTreeGenre } from '../../../fixtures/elements/genre-tree'
import { GenreDetailsPage } from '../../../fixtures/pages/genre-details'

const TEST_ACCOUNT = {
  username: 'test-username-genre-tree-links',
  password: 'test-password-genre-tree-links',
}

export default function linksTests() {
  test.describe('links', () => {
    test('should open the genre page when clicking a genre link', async ({
      withAccount,
      withGenres,
      genresPage,
      genreTree,
      page,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      const [genre] = await withGenres([{ name: 'Genre' }], account.id)

      await genresPage.goto()

      await new GenreTreeGenre(genreTree.genres.first()).link.click()
      await expect(page).toHaveURL(GenreDetailsPage.url(genre.id))
    })
  })
}
