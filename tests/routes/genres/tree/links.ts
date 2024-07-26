import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { GenreTreeGenre } from '../../../fixtures/elements/genre-tree'
import { GenreDetailsPage } from '../../../fixtures/pages/genre-details'
import { type CreatedGenre, createGenres, deleteGenres } from '../../../utils'

export default function linksTests() {
  test.describe('links', () => {
    let genre: CreatedGenre

    test.beforeAll(async ({ dbConnection }) => {
      ;[genre] = await createGenres([{ name: 'Genre' }], dbConnection)
    })

    test.afterAll(async ({ dbConnection }) => {
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
