import { expect } from '@playwright/test'

import { createGenreHistoryEntry } from '$lib/server/db/utils'

import { test } from '../../../fixtures'
import { GenreDiffEntry } from '../../../fixtures/elements/genre-diff'
import type { GenreFormData } from '../../../fixtures/elements/genre-form'
import {
  createAccounts,
  type CreatedAccount,
  type CreatedGenre,
  createGenres,
  deleteAccounts,
  deleteGenres,
  type InsertTestGenre,
} from '../../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-genres-edit',
  password: 'test-password-genres-edit',
}

export default function editGenrePageTests() {
  test.describe('edit', () => {
    test.describe('when not logged in', () => {
      let genre: CreatedGenre

      test.beforeAll(async () => {
        ;[genre] = await createGenres([{ name: 'test' }])
      })

      test.afterAll(async () => {
        await deleteGenres()
      })

      test.beforeEach(async ({ editGenrePage }) => {
        await editGenrePage.goto(genre.id)
      })

      test('should show error message', async ({ errorPage }) => {
        await errorPage.expectError('403', 'You do not have permission to edit genres')
      })
    })

    test.describe('when logged in', () => {
      test.describe('without EDIT_GENRES permission', () => {
        let genre: CreatedGenre

        test.beforeAll(async () => {
          await createAccounts([TEST_ACCOUNT])
          ;[genre] = await createGenres([{ name: 'test' }])
        })

        test.afterAll(async () => {
          await deleteAccounts([TEST_ACCOUNT.username])
          await deleteGenres()
        })

        test.beforeEach(async ({ signInPage, editGenrePage }) => {
          await signInPage.goto()
          await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
          await editGenrePage.goto(genre.id)
        })

        test('should show error message', async ({ errorPage }) => {
          await errorPage.expectError('403', 'You do not have permission to edit genres')
        })
      })

      test.describe('with EDIT_GENRES permission', () => {
        const genreData = {
          name: 'edited-genre',
          subtitle: 'subtitle',
          type: 'STYLE',
          akas: { primary: ['primary'], secondary: ['secondary'], tertiary: ['tertiary'] },
          parents: ['parent1', 'parent2'],
          influences: ['influence1', 'influence2'],
          shortDescription: 'short description',
          longDescription: 'long description',
          notes: 'notes',
        } satisfies InsertTestGenre

        let account: CreatedAccount
        let genre: CreatedGenre

        test.beforeAll(async () => {
          ;[account] = await createAccounts([{ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] }])
        })

        test.afterAll(async () => {
          await deleteAccounts([TEST_ACCOUNT.username])
        })

        test.beforeEach(async ({ signInPage, editGenrePage }) => {
          ;[genre] = await createGenres([
            genreData,
            ...genreData.parents.map((name) => ({ name })),
            ...genreData.influences.map((name) => ({ name })),
            ...genreData.parents.map((name) => ({ name: name + '-edited' })),
            ...genreData.influences.map((name) => ({ name: name + '-edited' })),
          ])

          await createGenreHistoryEntry({
            genre,
            accountId: account.id,
            operation: 'CREATE',
          })

          await signInPage.goto()
          await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
          await editGenrePage.goto(genre.id)
        })

        test.afterEach(async () => {
          await deleteGenres()
        })

        test('should only require name', async ({ editGenrePage, genrePage }) => {
          await expect(editGenrePage.nameInput).toHaveAttribute('required')
          await editGenrePage.editGenre({
            name: 'a',
            subtitle: '',
            akas: { primary: '', secondary: '', tertiary: '' },
            parents: [],
            influences: [],
            shortDescription: '',
            longDescription: '',
            notes: '',
          })
          await expect(genrePage.name).toHaveText('a')
        })

        test('should fill form with existing genre data', async ({ editGenrePage }) => {
          await expect(editGenrePage.nameInput).toHaveValue(genreData.name)
          await expect(editGenrePage.subtitleInput).toHaveValue(genreData.subtitle)
          await expect(editGenrePage.akaInputs.primary).toHaveValue(
            genreData.akas.primary.join(', '),
          )
          await expect(editGenrePage.akaInputs.secondary).toHaveValue(
            genreData.akas.secondary.join(', '),
          )
          await expect(editGenrePage.akaInputs.tertiary).toHaveValue(
            genreData.akas.tertiary.join(', '),
          )
          for (const [i, parent] of genreData.parents.entries()) {
            await expect(editGenrePage.selectedParents.nth(i)).toHaveText(parent)
          }
          await expect(editGenrePage.parentsInput).toHaveValue('')
          for (const [i, influence] of genreData.influences.entries()) {
            await expect(editGenrePage.selectedInfluences.nth(i)).toHaveText(influence)
          }
          await expect(editGenrePage.influencesInput).toHaveValue('')
          await expect(editGenrePage.shortDescriptionInput).toHaveValue(genreData.shortDescription)
          await expect(editGenrePage.longDescriptionInput).toHaveValue(genreData.longDescription)
          await expect(editGenrePage.notesInput).toHaveValue(genreData.notes)
        })

        test('should update a genre when fields are edited', async ({
          editGenrePage,
          genrePage,
        }) => {
          const genre = {
            name: genreData.name + '-edited',
            subtitle: genreData.subtitle + '-edited',
            akas: {
              primary: genreData.akas.primary.map((aka) => aka + '-edited').join(', '),
              secondary: genreData.akas.secondary.map((aka) => aka + '-edited').join(', '),
              tertiary: genreData.akas.tertiary.map((aka) => aka + '-edited').join(', '),
            },
            type: 'META',
            parents: genreData.parents.map((parent) => parent + '-edited'),
            influences: genreData.influences.map((influence) => influence + '-edited'),
            shortDescription: genreData.shortDescription + '-edited',
            longDescription: genreData.longDescription + '-edited',
            notes: genreData.notes + '-edited',
          } satisfies GenreFormData

          await editGenrePage.editGenre(genre)

          await genrePage.expectGenreData(genre)
          await expect(genrePage.contributors).toHaveText(TEST_ACCOUNT.username)
        })

        test('should not create a history entry when no changes are made', async ({
          editGenrePage,
          genrePage,
          genreHistoryPage,
        }) => {
          await editGenrePage.saveButton.click()
          await genrePage.historyButton.click()

          await expect(genreHistoryPage.entries).toHaveCount(1)

          await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(0)).operation).toHaveText(
            'Create',
          )
          await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(0)).account).toHaveText(
            TEST_ACCOUNT.username,
          )
          await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(0)).name).toHaveText(
            genreData.name,
          )
        })

        test('should create a history entry when changes are made', async ({
          editGenrePage,
          genrePage,
          genreHistoryPage,
        }) => {
          await editGenrePage.editGenre({
            name: genreData.name + '-edited',
          })

          await genrePage.historyButton.click()

          await expect(genreHistoryPage.entries).toHaveCount(2)

          await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(0)).operation).toHaveText(
            'Create',
          )
          await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(0)).account).toHaveText(
            TEST_ACCOUNT.username,
          )
          await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(0)).name).toHaveText(
            genreData.name,
          )

          await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(1)).operation).toHaveText(
            'Update',
          )
          await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(1)).account).toHaveText(
            TEST_ACCOUNT.username,
          )
          await expect(new GenreDiffEntry(genreHistoryPage.entries.nth(1)).name).toHaveText(
            genreData.name + '-edited',
          )
        })

        test('should not allow setting relevance', async ({ editGenrePage }) => {
          await expect(editGenrePage.relevanceInput).not.toBeVisible()
        })
      })
    })
  })
}
