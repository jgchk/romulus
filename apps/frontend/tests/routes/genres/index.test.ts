import { expect } from '@playwright/test'

import type { InsertAccount } from '$lib/server/db/schema'

import { test } from '../../fixtures'
import { GenreDiffEntry } from '../../fixtures/elements/genre-diff'
import { GenreTreeGenre } from '../../fixtures/elements/genre-tree'
import createGenrePageTests from './create'
import editGenrePageTests from './edit'
import treeTests from './tree'

createGenrePageTests()
editGenrePageTests()
treeTests()

const TEST_ACCOUNT: InsertAccount = {
  username: 'test-username-genres-page',
  password: 'test-password-genres-page',
  permissions: ['EDIT_GENRES'],
}

test.describe('genres page', () => {
  test("when the user deletes a genre, its children should be moved under the genre's parents and history entries should be created", async ({
    withAccount,
    withGenres,
    signInPage,
    genrePage,
    genreTree,
    genreHistoryPage,
  }) => {
    const account = await withAccount(TEST_ACCOUNT)
    const genres = await withGenres(
      [
        { name: 'Parent' },
        { name: 'Child', parents: ['Parent'] },
        { name: 'Grandchild', parents: ['Child'] },
      ],
      account.id,
    )

    const parentGenre = genres.find((genre) => genre.name === 'Parent')
    if (!parentGenre) {
      throw new Error('Parent genre not found')
    }

    const childGenre = genres.find((genre) => genre.name === 'Child')
    if (!childGenre) {
      throw new Error('Child genre not found')
    }

    const grandchildGenre = genres.find((genre) => genre.name === 'Grandchild')
    if (!grandchildGenre) {
      throw new Error('Grandchild genre not found')
    }

    await signInPage.goto()
    await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

    await genrePage.goto(childGenre.id)
    await genrePage.delete()

    await expect(genreTree.genres).toHaveCount(2)
    await expect(new GenreTreeGenre(genreTree.genres.nth(0)).name).toHaveText('Parent')
    await expect(new GenreTreeGenre(genreTree.genres.nth(1)).name).toHaveText('Grandchild')

    await new GenreTreeGenre(genreTree.genres.nth(0)).collapseButton.click()
    await expect(genreTree.genres).toHaveCount(1)
    await expect(new GenreTreeGenre(genreTree.genres.nth(0)).name).toHaveText('Parent')

    await genreHistoryPage.goto(childGenre.id)
    await expect(genreHistoryPage.entries).toHaveCount(2)
    await new GenreDiffEntry(genreHistoryPage.entries.nth(1)).expectData({
      operation: 'Delete',
      account: TEST_ACCOUNT.username,
      name: 'Child',
      parents: 'Parent',
    })

    await genreHistoryPage.goto(grandchildGenre.id)
    await expect(genreHistoryPage.entries).toHaveCount(2)
    await new GenreDiffEntry(genreHistoryPage.entries.nth(1)).expectData({
      operation: 'Update',
      account: TEST_ACCOUNT.username,
      name: 'Grandchild',
      parents: 'Parent Deleted',
    })

    await genreHistoryPage.goto(parentGenre.id)
    await expect(genreHistoryPage.entries).toHaveCount(1)
  })
})
