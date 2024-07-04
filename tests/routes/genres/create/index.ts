import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { GenreDiffEntry } from '../../../fixtures/elements/genre-diff'
import type { GenreFormData } from '../../../fixtures/elements/genre-form'
import { createAccounts, createGenres, deleteAccounts, deleteGenres } from '../../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-genres-create',
  password: 'test-password-genres-create',
}

export default function createGenrePageTests() {
  test.describe('create', () => {
    test.describe('when not logged in', () => {
      test.beforeEach(async ({ createGenrePage }) => {
        await createGenrePage.goto()
      })

      test('should show error message', async ({ errorPage }) => {
        await errorPage.expectError('403', 'You do not have permission to create genres')
      })
    })

    test.describe('when logged in', () => {
      test.describe('without EDIT_GENRES permission', () => {
        test.beforeAll(async () => {
          await createAccounts([TEST_ACCOUNT])
        })

        test.afterAll(async () => {
          await deleteAccounts([TEST_ACCOUNT.username])
        })

        test.beforeEach(async ({ signInPage, createGenrePage }) => {
          await signInPage.goto()
          await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
          await createGenrePage.goto()
        })

        test('should show error message', async ({ errorPage }) => {
          await errorPage.expectError('403', 'You do not have permission to create genres')
        })
      })

      test.describe('with EDIT_GENRES permission', () => {
        test.beforeAll(async () => {
          await createAccounts([{ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] }])
        })

        test.afterAll(async () => {
          await deleteAccounts([TEST_ACCOUNT.username])
        })

        test.beforeEach(async ({ signInPage, createGenrePage }) => {
          await createGenres([
            { name: 'parent-one' },
            { name: 'parent-two' },
            { name: 'influence-one' },
            { name: 'influence-two' },
          ])

          await signInPage.goto()
          await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
          await createGenrePage.goto()
        })

        test.afterEach(async () => {
          await deleteGenres()
        })

        test('should only require name', async ({ createGenrePage, genrePage }) => {
          await expect(createGenrePage.nameInput).toHaveAttribute('required')
          await createGenrePage.createGenre({ name: 'a' })
          await expect(genrePage.name).toHaveText('a')
          await expect(genrePage.relevance).toHaveText('None set. Vote.')
        })

        test('should default to Style type', async ({ createGenrePage }) => {
          await expect(createGenrePage.typeInput).toHaveText('Style')
        })

        test('should create a genre with all fields filled', async ({
          createGenrePage,
          genrePage,
        }) => {
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

        test('should create a history entry', async ({
          createGenrePage,
          genrePage,
          genreHistoryPage,
        }) => {
          await createGenrePage.createGenre({ name: 'created-genre' })

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
    })
  })
}
