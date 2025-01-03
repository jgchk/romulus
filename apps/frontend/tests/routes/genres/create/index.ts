import { expect } from '@playwright/test'
import { eq } from 'drizzle-orm'

import { genres } from '$lib/server/db/schema'

import { test } from '../../../fixtures'
import { GenreDiffEntry } from '../../../fixtures/elements/genre-diff'
import type { GenreFormData } from '../../../fixtures/elements/genre-form'
import { deleteGenres } from '../../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-genres-create',
  password: 'test-password-genres-create',
}

export default function createGenrePageTests() {
  test.describe('create', () => {
    test.afterEach(async ({ dbConnection }) => {
      // delete created-genre
      const createdGenres = await dbConnection.query.genres.findMany({
        where: eq(genres.name, 'created-genre'),
      })
      await deleteGenres(
        createdGenres.map((genre) => genre.id),
        dbConnection,
      )
    })

    test('when not logged in, should show error message', async ({
      createGenrePage,
      errorPage,
    }) => {
      await createGenrePage.goto()
      await errorPage.expectError('403', 'You do not have permission to create genres')
    })

    test('when logged in without EDIT_GENRES permission, should show error message', async ({
      withAccount,
      signInPage,
      createGenrePage,
      errorPage,
    }) => {
      await withAccount(TEST_ACCOUNT)

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await createGenrePage.goto()

      await errorPage.expectError('403', 'You do not have permission to create genres')
    })

    test('when logged in with EDIT_GENRES permission, should default to Style type', async ({
      withAccount,
      withGenres,
      signInPage,
      createGenrePage,
    }) => {
      const account = await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })
      await withGenres(
        [
          { name: 'parent-one' },
          { name: 'parent-two' },
          { name: 'influence-one' },
          { name: 'influence-two' },
        ],
        account.id,
      )

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await createGenrePage.goto()

      await expect(createGenrePage.typeInput).toHaveText('Style')
    })

    test('when logged in with EDIT_GENRES permission, should create a genre with all fields filled', async ({
      withAccount,
      withGenres,
      signInPage,
      createGenrePage,
      genrePage,
    }) => {
      const account = await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })
      await withGenres(
        [
          { name: 'parent-one' },
          { name: 'parent-two' },
          { name: 'influence-one' },
          { name: 'influence-two' },
        ],
        account.id,
      )

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await createGenrePage.goto()

      const genre = {
        name: 'created-genre',
        subtitle: 'subtitle',
        akas: {
          primary: 'primary-one, primary-two',
          secondary: 'secondary-one, secondary-two',
          tertiary: 'tertiary-one, tertiary-two',
        },
        type: 'META',
        parents: ['parent-one', 'parent-two'],
        influences: ['influence-one', 'influence-two'],
        relevance: 3,
        shortDescription: 'short description',
        longDescription: 'long description',
        notes: 'notes',
      } satisfies GenreFormData

      await createGenrePage.createGenre(genre)

      await genrePage.expectGenreData(genre)
      await expect(genrePage.contributors).toHaveText(TEST_ACCOUNT.username)
    })

    test('when logged in with EDIT_GENRES permission, should create a history entry', async ({
      withAccount,
      withGenres,
      signInPage,
      createGenrePage,
      genrePage,
      genreHistoryPage,
    }) => {
      const account = await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })
      await withGenres(
        [
          { name: 'parent-one' },
          { name: 'parent-two' },
          { name: 'influence-one' },
          { name: 'influence-two' },
        ],
        account.id,
      )

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await createGenrePage.goto()

      await createGenrePage.createGenre({ name: 'created-genre', parents: ['parent-one'] })

      await genrePage.historyButton.click()

      await expect(genreHistoryPage.entries).toHaveCount(1)

      await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(0)).operation).toHaveText(
        'Create',
      )
      await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(0)).account).toHaveText(
        TEST_ACCOUNT.username,
      )
      await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(0)).name).toHaveText(
        'created-genre',
      )
    })
  })
}
