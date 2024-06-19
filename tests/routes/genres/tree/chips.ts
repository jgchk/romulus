import { expect } from '@playwright/test'

import { test } from '../../../fixtures'
import { GenreTreeGenre } from '../../../fixtures/elements/genre-tree'
import { GenresPage } from '../../../fixtures/pages/genres'
import { createAccounts, createGenres, deleteAccounts, deleteGenres } from '../../../utils'
import { type InsertTestGenre } from '../../../utils/genres'

const TEST_ACCOUNT = {
  username: 'test-username-genre-tree-chips',
  password: 'test-password-genre-tree-chips',
}

export const TEST_GENRES: InsertTestGenre[] = [
  { name: 'Meta', type: 'META', relevance: 99 },
  { name: 'Movement', type: 'MOVEMENT', relevance: 7 },
  { name: 'Scene', type: 'SCENE', relevance: 6 },
  { name: 'Style', type: 'STYLE', relevance: 1 },
  { name: 'Trend', type: 'TREND', relevance: 0 },
]

export default function chipsTests() {
  test.describe('chips', () => {
    test.describe('when not logged in', () => {
      test.beforeAll(async () => {
        await createGenres(TEST_GENRES)
      })

      test.afterAll(async () => {
        await deleteGenres()
      })

      test.beforeEach(async ({ genresPage }) => {
        await genresPage.goto()
      })

      testTypeTagVisibility(true)
      testRelevanceTagVisiblity(false)
    })

    test.describe('when logged in with default account settings', () => {
      test.beforeAll(async () => {
        await createGenres(TEST_GENRES)
        await createAccounts([TEST_ACCOUNT])
      })

      test.afterAll(async () => {
        await deleteGenres()
        await deleteAccounts([TEST_ACCOUNT.username])
      })

      test.beforeEach(async ({ genresPage }) => {
        await genresPage.goto()
      })

      testTypeTagVisibility(true)
      testRelevanceTagVisiblity(false)
    })

    test.describe('when logged in with type tags enabled and relevance tags disabled', () => {
      test.beforeAll(async () => {
        await createGenres(TEST_GENRES)
        await createAccounts([{ ...TEST_ACCOUNT, showTypeTags: true, showRelevanceTags: false }])
      })

      test.afterAll(async () => {
        await deleteGenres()
        await deleteAccounts([TEST_ACCOUNT.username])
      })

      test.beforeEach(async ({ signInPage }) => {
        await signInPage.goto()
        await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
        await signInPage.page.waitForURL(GenresPage.url)
      })

      testTypeTagVisibility(true)
      testRelevanceTagVisiblity(false)
    })

    test.describe('when logged in with type tags disabled and relevance tags enabled', () => {
      test.beforeAll(async () => {
        await createGenres(TEST_GENRES)
        await createAccounts([{ ...TEST_ACCOUNT, showTypeTags: false, showRelevanceTags: true }])
      })

      test.afterAll(async () => {
        await deleteGenres()
        await deleteAccounts([TEST_ACCOUNT.username])
      })

      test.beforeEach(async ({ signInPage }) => {
        await signInPage.goto()
        await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
        await signInPage.page.waitForURL(GenresPage.url)
      })

      testTypeTagVisibility(false)
      testRelevanceTagVisiblity(true)
    })

    test.describe('when logged in with both tags enabled', () => {
      test.beforeAll(async () => {
        await createGenres(TEST_GENRES)
        await createAccounts([{ ...TEST_ACCOUNT, showTypeTags: true, showRelevanceTags: true }])
      })

      test.afterAll(async () => {
        await deleteGenres()
        await deleteAccounts([TEST_ACCOUNT.username])
      })

      test.beforeEach(async ({ signInPage }) => {
        await signInPage.goto()
        await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
        await signInPage.page.waitForURL(GenresPage.url)
      })

      testTypeTagVisibility(true)
      testRelevanceTagVisiblity(true)
    })
  })
}

function testTypeTagVisibility(visible: boolean) {
  if (visible) {
    test('should show type tags for each genre type except Style', async ({ genreTree }) => {
      await expect(new GenreTreeGenre(genreTree.genres.nth(0)).typeChip).toHaveText('Meta')
      await expect(new GenreTreeGenre(genreTree.genres.nth(1)).typeChip).toHaveText('Mvmt')
      await expect(new GenreTreeGenre(genreTree.genres.nth(2)).typeChip).toHaveText('Scene')
      await expect(new GenreTreeGenre(genreTree.genres.nth(3)).typeChip).not.toBeVisible() // Style
      await expect(new GenreTreeGenre(genreTree.genres.nth(4)).typeChip).toHaveText('Trend')
    })
  } else {
    test('should not show type tags', async ({ genreTree }) => {
      await expect(new GenreTreeGenre(genreTree.genres.nth(0)).typeChip).not.toBeVisible()
      await expect(new GenreTreeGenre(genreTree.genres.nth(1)).typeChip).not.toBeVisible()
      await expect(new GenreTreeGenre(genreTree.genres.nth(2)).typeChip).not.toBeVisible()
      await expect(new GenreTreeGenre(genreTree.genres.nth(3)).typeChip).not.toBeVisible()
      await expect(new GenreTreeGenre(genreTree.genres.nth(4)).typeChip).not.toBeVisible()
    })
  }
}

function testRelevanceTagVisiblity(visible: boolean) {
  if (visible) {
    test('should show relevance tags', async ({ genreTree }) => {
      await expect(new GenreTreeGenre(genreTree.genres.nth(0)).relevanceChip).toHaveText('?')
      await expect(new GenreTreeGenre(genreTree.genres.nth(1)).relevanceChip).toHaveText('7')
      await expect(new GenreTreeGenre(genreTree.genres.nth(2)).relevanceChip).toHaveText('6')
      await expect(new GenreTreeGenre(genreTree.genres.nth(3)).relevanceChip).toHaveText('1')
      await expect(new GenreTreeGenre(genreTree.genres.nth(4)).relevanceChip).toHaveText('0')
    })
  } else {
    test('should not show relevance tags', async ({ genreTree }) => {
      await expect(new GenreTreeGenre(genreTree.genres.nth(0)).relevanceChip).not.toBeVisible()
      await expect(new GenreTreeGenre(genreTree.genres.nth(1)).relevanceChip).not.toBeVisible()
      await expect(new GenreTreeGenre(genreTree.genres.nth(2)).relevanceChip).not.toBeVisible()
      await expect(new GenreTreeGenre(genreTree.genres.nth(3)).relevanceChip).not.toBeVisible()
      await expect(new GenreTreeGenre(genreTree.genres.nth(4)).relevanceChip).not.toBeVisible()
    })
  }
}
