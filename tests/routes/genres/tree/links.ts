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
  username: 'test-username-genre-tree-links',
  password: 'test-password-genre-tree-links',
}

export default function linksTests() {
  test.describe('links', () => {
    let genre: CreatedGenre

    test.beforeAll(async ({ dbConnection }) => {
      const [account] = await createAccounts([TEST_ACCOUNT], dbConnection)
      ;[genre] = await createGenres([{ name: 'Genre' }], account.id, dbConnection)
    })

    test.afterAll(async ({ dbConnection }) => {
      await deleteAccounts([TEST_ACCOUNT.username], dbConnection)
      await deleteGenres(dbConnection)
    })

    test.beforeEach(async ({ genresPage }) => {
      await genresPage.goto()
    })

    test('should open the genre page when clicking a genre link', async ({ page, genreTree }) => {
      await new GenreTreeGenre(genreTree.genres.first()).link.click()
      await expect(page).toHaveURL(GenreDetailsPage.url(genre.id))
    })
  })
}
