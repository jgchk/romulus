import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { GenreDiffEntry } from '../../../fixtures/elements/genre-diff'
import type { GenreFormData } from '../../../fixtures/elements/genre-form'
import { type InsertTestGenre } from '../../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-genres-edit',
  password: 'test-password-genres-edit',
}

export default function editGenrePageTests() {
  test.describe('edit', () => {
    test('when not logged in, should show error message', async ({
      withAccount,
      withGenres,
      editGenrePage,
      errorPage,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      const [genre] = await withGenres([{ name: 'test' }], account.id)

      await editGenrePage.goto(genre.id)

      await errorPage.expectError('403', 'You do not have permission to edit genres')
    })

    test('when logged in without EDIT_GENRES permission, should show error message', async ({
      withAccount,
      withGenres,
      signInPage,
      editGenrePage,
      errorPage,
    }) => {
      const account = await withAccount(TEST_ACCOUNT)
      const [genre] = await withGenres([{ name: 'test' }], account.id)

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
      await editGenrePage.goto(genre.id)

      await editGenrePage.goto(genre.id)

      await errorPage.expectError('403', 'You do not have permission to edit genres')
    })

    test('when logged in with EDIT_GENRES permission, should fill in form with existing data', async ({
      withAccount,
      withGenres,
      signInPage,
      editGenrePage,
    }) => {
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

      const account = await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })
      const [genre] = await withGenres(
        [
          genreData,
          ...genreData.parents.map((name) => ({ name })),
          ...genreData.influences.map((name) => ({ name })),
          ...genreData.parents.map((name) => ({ name: name + '-edited' })),
          ...genreData.influences.map((name) => ({ name: name + '-edited' })),
        ],
        account.id,
      )

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await editGenrePage.goto(genre.id)

      await expect(editGenrePage.nameInput).toHaveValue(genreData.name)
      await expect(editGenrePage.subtitleInput).toHaveValue(genreData.subtitle)
      await expect(editGenrePage.akaInputs.primary).toHaveValue(genreData.akas.primary.join(', '))
      await expect(editGenrePage.akaInputs.secondary).toHaveValue(
        genreData.akas.secondary.join(', '),
      )
      await expect(editGenrePage.akaInputs.tertiary).toHaveValue(genreData.akas.tertiary.join(', '))
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

    test('when logged in with EDIT_GENRES permission, should update a genre when fields are edited', async ({
      withAccount,
      withGenres,
      signInPage,
      editGenrePage,
      genrePage,
    }) => {
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

      const account = await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })
      const [genre] = await withGenres(
        [
          genreData,
          ...genreData.parents.map((name) => ({ name })),
          ...genreData.influences.map((name) => ({ name })),
          ...genreData.parents.map((name) => ({ name: name + '-edited' })),
          ...genreData.influences.map((name) => ({ name: name + '-edited' })),
        ],
        account.id,
      )

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await editGenrePage.goto(genre.id)

      const updateData = {
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

      await editGenrePage.editGenre(updateData)

      await genrePage.expectGenreData(updateData)
      await expect(genrePage.contributors).toHaveText(TEST_ACCOUNT.username)
    })

    test('when logged in with EDIT_GENRES permission, should not create a history entry when no changes are made', async ({
      withAccount,
      withGenres,
      signInPage,
      editGenrePage,
      genrePage,
      genreHistoryPage,
    }) => {
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

      const account = await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })
      const [genre] = await withGenres(
        [
          genreData,
          ...genreData.parents.map((name) => ({ name })),
          ...genreData.influences.map((name) => ({ name })),
          ...genreData.parents.map((name) => ({ name: name + '-edited' })),
          ...genreData.influences.map((name) => ({ name: name + '-edited' })),
        ],
        account.id,
      )

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await editGenrePage.goto(genre.id)

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

    test('when logged in with EDIT_GENRES permission, should create a history entry when changes are made', async ({
      withAccount,
      withGenres,
      signInPage,
      editGenrePage,
      genrePage,
      genreHistoryPage,
    }) => {
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

      const account = await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })
      const [genre] = await withGenres(
        [
          genreData,
          ...genreData.parents.map((name) => ({ name })),
          ...genreData.influences.map((name) => ({ name })),
          ...genreData.parents.map((name) => ({ name: name + '-edited' })),
          ...genreData.influences.map((name) => ({ name: name + '-edited' })),
        ],
        account.id,
      )

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await editGenrePage.goto(genre.id)

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
        `${genreData.name}-edited ${genreData.name}`,
      )
    })

    test('when logged in with EDIT_GENRES permission, should not allow setting relevance', async ({
      withAccount,
      withGenres,
      signInPage,
      editGenrePage,
    }) => {
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

      const account = await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })
      const [genre] = await withGenres(
        [
          genreData,
          ...genreData.parents.map((name) => ({ name })),
          ...genreData.influences.map((name) => ({ name })),
          ...genreData.parents.map((name) => ({ name: name + '-edited' })),
          ...genreData.influences.map((name) => ({ name: name + '-edited' })),
        ],
        account.id,
      )

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await editGenrePage.goto(genre.id)

      await expect(editGenrePage.relevanceInput).not.toBeVisible()
    })
  })
}
