import { expect } from '@playwright/test'
import { eq } from 'drizzle-orm'

import { genres } from '$lib/server/db/schema'

import { test } from '../../../fixtures'
import { GenreTreeGenre } from '../../../fixtures/elements/genre-tree'
import { GenreDetailsPage } from '../../../fixtures/pages/genre-details'
import { deleteGenres } from '../../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-genre-tree-operations',
  password: 'test-password-genre-tree-operations',
}

export default function operationsTests() {
  test.describe('operations', () => {
    test.afterEach(async ({ dbConnection }) => {
      const createdGenres = await dbConnection.query.genres.findMany({
        where: eq(genres.name, 'Genre'),
      })
      await deleteGenres(
        createdGenres.map((genre) => genre.id),
        dbConnection,
      )
    })

    test('when there are 0 genres, should update with new genre upon creation', async ({
      withAccount,
      signInPage,
      genreTree,
      genresPage,
      createGenrePage,
    }) => {
      await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await expect(genreTree.genres).toHaveCount(0)

      await genresPage.navigator.createGenreButton.click()
      await createGenrePage.createGenre({ name: 'Genre', type: 'STYLE' })

      await expect(genreTree.genres).toHaveCount(1)
      await expect(new GenreTreeGenre(genreTree.genres.first()).name).toHaveText('Genre')
    })

    test('when there is 1 genre, should update the genre name upon edit', async ({
      withAccount,
      withGenres,
      signInPage,
      genreTree,
      genrePage,
      editGenrePage,
    }) => {
      const account = await withAccount({
        ...TEST_ACCOUNT,
        permissions: ['EDIT_GENRES'],
        showTypeTags: true,
        showRelevanceTags: true,
      })
      await withGenres([{ name: 'Genre', type: 'STYLE' }], account.id)

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await expect(new GenreTreeGenre(genreTree.genres.first()).name).toHaveText('Genre')
      await new GenreTreeGenre(genreTree.genres.first()).link.click()
      await genrePage.editButton.click()
      await editGenrePage.editGenre({ name: 'New Genre' })
      await expect(new GenreTreeGenre(genreTree.genres.first()).name).toHaveText('New Genre')
    })

    test('when there is 1 genre, should update the subtitle upon edit', async ({
      withAccount,
      withGenres,
      signInPage,
      genreTree,
      genrePage,
      editGenrePage,
    }) => {
      const account = await withAccount({
        ...TEST_ACCOUNT,
        permissions: ['EDIT_GENRES'],
        showTypeTags: true,
        showRelevanceTags: true,
      })
      await withGenres([{ name: 'Genre', type: 'STYLE' }], account.id)

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await expect(new GenreTreeGenre(genreTree.genres.first()).subtitle).not.toBeVisible()
      await new GenreTreeGenre(genreTree.genres.first()).link.click()
      await genrePage.editButton.click()
      await editGenrePage.editGenre({ subtitle: 'New subtitle' })
      await expect(new GenreTreeGenre(genreTree.genres.first()).subtitle).toBeVisible()
    })

    test('when there is 1 genre, should update the type chip upon edit', async ({
      withAccount,
      withGenres,
      signInPage,
      genreTree,
      genrePage,
      editGenrePage,
    }) => {
      const account = await withAccount({
        ...TEST_ACCOUNT,
        permissions: ['EDIT_GENRES'],
        showTypeTags: true,
        showRelevanceTags: true,
      })
      await withGenres([{ name: 'Genre', type: 'STYLE' }], account.id)

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await expect(new GenreTreeGenre(genreTree.genres.first()).typeChip).not.toBeVisible()
      await new GenreTreeGenre(genreTree.genres.first()).link.click()
      await genrePage.editButton.click()
      await editGenrePage.editGenre({ type: 'TREND' })
      await expect(new GenreTreeGenre(genreTree.genres.first()).typeChip).toBeVisible()
      await expect(new GenreTreeGenre(genreTree.genres.first()).typeChip).toHaveText('Trend')
    })

    test('when there is 1 genre, should update the relevance upon vote', async ({
      withAccount,
      withGenres,
      signInPage,
      genreTree,
      genrePage,
    }) => {
      const account = await withAccount({
        ...TEST_ACCOUNT,
        permissions: ['EDIT_GENRES'],
        showTypeTags: true,
        showRelevanceTags: true,
      })
      const [genre] = await withGenres([{ name: 'Genre', type: 'STYLE' }], account.id)

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await expect(new GenreTreeGenre(genreTree.genres.first()).relevanceChip).toBeVisible()
      await expect(new GenreTreeGenre(genreTree.genres.first()).relevanceChip).toHaveText('?')
      await new GenreTreeGenre(genreTree.genres.first()).link.click()
      await genrePage.page.waitForURL(GenreDetailsPage.url(genre.id))
      await genrePage.vote(5)
      await expect(new GenreTreeGenre(genreTree.genres.first()).relevanceChip).toBeVisible()
      await expect(new GenreTreeGenre(genreTree.genres.first()).relevanceChip).toHaveText('5')
    })

    test('when there is 1 genre, should show empty state upon deletion', async ({
      withAccount,
      withGenres,
      signInPage,
      genreTree,
      genrePage,
    }) => {
      const account = await withAccount({
        ...TEST_ACCOUNT,
        permissions: ['EDIT_GENRES'],
        showTypeTags: true,
        showRelevanceTags: true,
      })
      await withGenres([{ name: 'Genre', type: 'STYLE' }], account.id)

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await expect(genreTree.genres).toHaveCount(1)
      await expect(genreTree.emptyState).not.toBeVisible()
      await new GenreTreeGenre(genreTree.genres.first()).link.click()
      await genrePage.delete()
      await expect(genreTree.emptyState).toBeVisible()
    })

    test('when there are 2 genres, should move child to root level when deleting parent genre', async ({
      withAccount,
      withGenres,
      signInPage,
      genreTree,
      genrePage,
    }) => {
      const account = await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })
      await withGenres([{ name: 'Parent' }, { name: 'Child', parents: ['Parent'] }], account.id)

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()

      await expect(genreTree.genres).toHaveCount(2)
      await expect(new GenreTreeGenre(genreTree.genres.nth(0)).name).toHaveText('Parent')
      await expect(new GenreTreeGenre(genreTree.genres.nth(1)).name).toHaveText('Child')

      await new GenreTreeGenre(genreTree.genres.nth(0)).link.click()

      await genrePage.delete()

      await expect(genreTree.genres).toHaveCount(1)
      await expect(new GenreTreeGenre(genreTree.genres.nth(0)).name).toHaveText('Child')
    })

    test('when there are 3 genres, should move grandchild under parent when deleting child genre', async ({
      withAccount,
      withGenres,
      signInPage,
      genreTree,
      genrePage,
    }) => {
      const account = await withAccount({ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] })
      await withGenres(
        [
          { name: 'Parent' },
          { name: 'Child', parents: ['Parent'] },
          { name: 'Grandchild', parents: ['Child'] },
        ],
        account.id,
      )

      await signInPage.goto()
      await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

      await new GenreTreeGenre(genreTree.genres.nth(0)).expandButton.click()
      await new GenreTreeGenre(genreTree.genres.nth(1)).expandButton.click()

      await expect(genreTree.genres).toHaveCount(3)
      await expect(new GenreTreeGenre(genreTree.genres.nth(0)).name).toHaveText('Parent')
      await expect(new GenreTreeGenre(genreTree.genres.nth(1)).name).toHaveText('Child')
      await expect(new GenreTreeGenre(genreTree.genres.nth(2)).name).toHaveText('Grandchild')

      await new GenreTreeGenre(genreTree.genres.nth(1)).link.click()

      await genrePage.delete()

      await expect(genreTree.genres).toHaveCount(2)
      await expect(new GenreTreeGenre(genreTree.genres.nth(0)).name).toHaveText('Parent')
      await expect(new GenreTreeGenre(genreTree.genres.nth(1)).name).toHaveText('Grandchild')
    })
  })
}
