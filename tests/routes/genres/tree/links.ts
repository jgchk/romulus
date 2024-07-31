import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { GenreTreeGenre } from '../../../fixtures/elements/genre-tree'
import { GenreDetailsPage } from '../../../fixtures/pages/genre-details'
import { createGenres, deleteGenres } from '../../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-genre-tree-links',
  password: 'test-password-genre-tree-links',
}

export default function linksTests() {
  test.describe('links', () => {
    test.afterAll(async ({ dbConnection }) => {
      await deleteGenres(dbConnection)
    })

    test('should open the genre page when clicking a genre link', async ({
      withAccount,
      dbConnection,
      genresPage,
      genreTree,
      page,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      const [genre] = await createGenres([{ name: 'Genre' }], account.id, dbConnection)

      await genresPage.goto()

      await new GenreTreeGenre(genreTree.genres.first()).link.click()
      await expect(page).toHaveURL(GenreDetailsPage.url(genre.id))
    })
  })
}
