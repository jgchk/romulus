import { expect } from '@playwright/test'

import { test } from '../../fixtures'
import { CreateGenrePage } from '../../fixtures/pages/genre-create'
import { GenreDetailsPage } from '../../fixtures/pages/genre-details'
import { GenresPage, GenreTreeGenre } from '../../fixtures/pages/genres'
import {
  createAccounts,
  type CreatedGenre,
  createGenres,
  deleteAccounts,
  deleteGenres,
} from '../../utils'
import { parentChildGenre, singleGenre } from '../../utils/genres'

// tree
// - 0 genres:
//   x should show empty state
// - 1 genre:
//   x should show genre link, be clickable, and not be expandable
//   x deleting a genre should remove it from the tree
// - 2 genres:
//   x should show parent-child relationship (expandable, contractable)
//   x deleting a genre should remove it from the tree
// - 3 genres:
//   - deleting the middle genre should move the leaf genre under the parent genre
//
// search
// - 0 genres:
//   - should show empty state
// - 1 genre:
//   - should show genre link and be clickable
//   - deleting a genre should remove it from results
// - 2 genres:
//   - results should be ordered by closest match

// 0 genres:
//   - should show empty state
//   - should show empty state when searching
// 1 genre:
//   - should show genre link in tree
//   - should show genre link when searching

// should show only parent genres initially
// should expand parent genres when clicking expand
// genres with no children should not be expandable
// clicking on a genre should open the relevant link
// should show subtitle in brackets
// deleting a genre should remove it from the tree
//  --- Deletion behavior needs to be thoroughly tested, e.g. test that deleting a genre moves all the children under its parents

const TEST_ACCOUNT = {
  username: 'test-username-genres',
  password: 'test-password-genres',
}

test.describe('Genre Tree', () => {
  test.beforeEach(async ({ genresPage }) => {
    await genresPage.goto()
  })

  test.describe('when there are 0 genres', () => {
    test.describe('when user is not logged in', () => {
      test('should show empty state', async ({ genresPage }) => {
        await expect(genresPage.navigator.tree.emptyState).toBeVisible()
        await expect(genresPage.navigator.tree.createGenreLink).not.toBeVisible()
      })
    })

    test.describe('when user is logged in', () => {
      test.describe('with EDIT_GENRES permission', () => {
        test.beforeAll(async () => {
          await createAccounts([{ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] }])
        })

        test.afterAll(async () => {
          await deleteAccounts([TEST_ACCOUNT.username])
        })

        test.beforeEach(async ({ signInPage }) => {
          await signInPage.goto()
          await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
          await signInPage.page.waitForURL(GenresPage.url)
        })

        test('should show empty state with CTA to create a genre', async ({ genresPage }) => {
          await expect(genresPage.navigator.tree.emptyState).toBeVisible()
          await expect(genresPage.navigator.tree.createGenreLink).toBeVisible()
          await genresPage.navigator.tree.createGenreLink.click()
          await expect(genresPage.page).toHaveURL(CreateGenrePage.url)
        })
      })

      test.describe('without EDIT_GENRES permission', () => {
        test.beforeAll(async () => {
          await createAccounts([TEST_ACCOUNT])
        })

        test.afterAll(async () => {
          await deleteAccounts([TEST_ACCOUNT.username])
        })

        test.beforeEach(async ({ signInPage }) => {
          await signInPage.goto()
          await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
          await signInPage.page.waitForURL(GenresPage.url)
        })

        test('should show empty state', async ({ genresPage }) => {
          await expect(genresPage.navigator.tree.emptyState).toBeVisible()
          await expect(genresPage.navigator.tree.createGenreLink).not.toBeVisible()
        })
      })
    })
  })

  test.describe('when there is 1 genre', () => {
    let genre: CreatedGenre

    test.beforeAll(async () => {
      ;[genre] = await createGenres([singleGenre])
    })

    test.afterAll(async () => {
      await deleteGenres()
    })

    test.describe('the genre link', () => {
      test('should render', async ({ genresPage }) => {
        await expect(genresPage.navigator.tree.genres).toHaveCount(1)
      })

      test('should open the genre page on click', async ({ genresPage }) => {
        await new GenreTreeGenre(genresPage.navigator.tree.genres.first()).link.click()
        await expect(genresPage.page).toHaveURL(GenreDetailsPage.url(genre.id))
      })

      test('should not be expandable', async ({ genresPage }) => {
        await expect(
          new GenreTreeGenre(genresPage.navigator.tree.genres.first()).expandButton,
        ).not.toBeVisible()
      })

      test.describe('when logged in', () => {
        test.beforeAll(async () => {
          await createAccounts([{ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] }])
        })

        test.afterAll(async () => {
          await deleteAccounts([TEST_ACCOUNT.username])
        })

        test.beforeEach(async ({ signInPage }) => {
          await signInPage.goto()
          await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
          await signInPage.page.waitForURL(GenresPage.url)
        })

        test('should be removed upon deletion', async ({ genresPage, genrePage }) => {
          await new GenreTreeGenre(genresPage.navigator.tree.genres.first()).link.click()
          await genrePage.delete()
          await expect(genresPage.navigator.tree.genres).toHaveCount(0)
          await expect(genresPage.navigator.tree.emptyState).toBeVisible()
        })
      })
    })
  })

  test.describe('when there are 2 parent-child genres', () => {
    test.describe('the parent genre link', () => {
      let parentGenre: CreatedGenre
      let childGenre: CreatedGenre

      test.beforeAll(async () => {
        ;[parentGenre, childGenre] = await createGenres(parentChildGenre)
      })

      test.afterAll(async () => {
        await deleteGenres()
      })

      test('should render', async ({ genresPage }) => {
        await expect(genresPage.navigator.tree.genres).toHaveCount(1)
      })

      test('should open the genre page and expand on click', async ({ genresPage }) => {
        await new GenreTreeGenre(genresPage.navigator.tree.genres.first()).link.click()
        await expect(genresPage.page).toHaveURL(GenreDetailsPage.url(parentGenre.id))
        await expect(genresPage.navigator.tree.genres).toHaveCount(2)
      })

      test('should expand/collapse on click expand/collapse button', async ({ genresPage }) => {
        await new GenreTreeGenre(genresPage.navigator.tree.genres.first()).expandButton.click()
        await expect(genresPage.navigator.tree.genres).toHaveCount(2)
        await new GenreTreeGenre(genresPage.navigator.tree.genres.first()).collapseButton.click()
        await expect(genresPage.navigator.tree.genres).toHaveCount(1)
      })

      test.describe('when logged in', () => {
        test.beforeAll(async () => {
          await createAccounts([{ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] }])
        })

        test.afterAll(async () => {
          await deleteAccounts([TEST_ACCOUNT.username])
        })

        test.beforeEach(async ({ signInPage }) => {
          await signInPage.goto()
          await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
          await signInPage.page.waitForURL(GenresPage.url)
        })

        test('should be removed upon deletion', async ({ genresPage, genrePage }) => {
          await new GenreTreeGenre(genresPage.navigator.tree.genres.first()).link.click()
          await genrePage.delete()
          await expect(genresPage.navigator.tree.genres).toHaveCount(1)
          await expect(genresPage.navigator.tree.genres).toContainText(parentChildGenre[1].name)
          await expect(
            new GenreTreeGenre(genresPage.navigator.tree.genres.first()).expandButton,
          ).not.toBeVisible()
        })
      })
    })

    test.describe('the child genre link', () => {
      let parentGenre: CreatedGenre
      let childGenre: CreatedGenre

      test.beforeAll(async () => {
        ;[parentGenre, childGenre] = await createGenres(parentChildGenre)
      })

      test.afterAll(async () => {
        await deleteGenres()
      })

      test.beforeEach(async ({ genresPage }) => {
        await new GenreTreeGenre(genresPage.navigator.tree.genres.first()).expandButton.click()
      })

      test('should render', async ({ genresPage }) => {
        await expect(genresPage.navigator.tree.genres).toHaveCount(2)
      })

      test('should open the genre page and not expand on click', async ({ genresPage }) => {
        await new GenreTreeGenre(genresPage.navigator.tree.genres.nth(1)).link.click()
        await expect(genresPage.page).toHaveURL(GenreDetailsPage.url(childGenre.id))
        await expect(genresPage.navigator.tree.genres).toHaveCount(2)
      })

      test('should not be expandable', async ({ genresPage }) => {
        await expect(
          new GenreTreeGenre(genresPage.navigator.tree.genres.nth(1)).expandButton,
        ).not.toBeVisible()
      })

      test.describe('when logged in', () => {
        test.beforeAll(async () => {
          await createAccounts([{ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] }])
        })

        test.afterAll(async () => {
          await deleteAccounts([TEST_ACCOUNT.username])
        })

        test.beforeEach(async ({ signInPage, genresPage }) => {
          await signInPage.goto()
          await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
          await signInPage.page.waitForURL(GenresPage.url)
          await new GenreTreeGenre(genresPage.navigator.tree.genres.first()).expandButton.click()
        })

        test('should be removed upon deletion', async ({ genresPage, genrePage }) => {
          await new GenreTreeGenre(genresPage.navigator.tree.genres.nth(1)).link.click()
          await genrePage.delete()
          await expect(genresPage.navigator.tree.genres).toHaveCount(1)
          await expect(genresPage.navigator.tree.genres).toContainText(parentChildGenre[0].name)
          await expect(
            new GenreTreeGenre(genresPage.navigator.tree.genres.first()).expandButton,
          ).not.toBeVisible()
        })
      })
    })
  })
})

// test.describe('when user is not logged in', () => {
//   test.beforeEach(async ({ genresPage }) => {
//     await genresPage.goto()
//   })

//   test('should not show genre settings button', async ({ genresPage }) => {
//     await expect(genresPage.navigator.settingsButton).not.toBeVisible()
//   })

//   test.describe('when there are no existing genres', () => {
//     test('should show empty state when searching', async ({ genresPage }) => {
//       await genresPage.navigator.search.input.fill('a')
//       await expect(genresPage.navigator.tree.emptyState).toBeVisible()
//       await expect(genresPage.navigator.tree.createGenreLink).not.toBeVisible()
//     })
//   })

//   test.describe('when there are existing genres', () => {
//     test.beforeAll(async () => {
//       await createGenres()
//     })

//     test.afterAll(async () => {
//       await deleteGenres()
//     })

//     test('should show genre links in tree', async ({ genresPage }) => {
//       await expect(genresPage.navigator.tree.genreLinks).toHaveCount(2, { timeout: 20 * 1000 })
//     })
//   })
// })

// test.describe('when user is logged in', () => {
//   test.describe('without EDIT_GENRE permission', () => {
//     test.beforeAll(async () => {
//       await createAccounts([TEST_ACCOUNT])
//     })

//     test.afterAll(async () => {
//       await deleteAccounts([TEST_ACCOUNT.username])
//     })

//     test.beforeEach(async ({ signInPage }) => {
//       await signInPage.goto()
//       await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
//       await signInPage.page.waitForURL(GenresPage.url)
//     })

//     test('should show genre settings button', async ({ genresPage }) => {
//       await expect(genresPage.navigator.settingsButton).toBeVisible()
//     })

//     test.describe('when there are no existing genres', () => {
//       test('should show empty state', async ({ genresPage }) => {
//         await expect(genresPage.navigator.tree.emptyState).toBeVisible()
//         await expect(genresPage.navigator.tree.createGenreLink).not.toBeVisible()
//       })

//       test('should show empty state when searching', async ({ genresPage }) => {
//         await genresPage.navigator.search.input.fill('a')
//         await expect(genresPage.navigator.tree.emptyState).toBeVisible()
//         await expect(genresPage.navigator.tree.createGenreLink).not.toBeVisible()
//       })
//     })

//     test.describe('when there are existing genres', () => {
//       test.beforeAll(async () => {
//         await createGenres()
//       })

//       test.afterAll(async () => {
//         await deleteGenres()
//       })

//       test('should show genre links in tree', async ({ genresPage }) => {
//         await expect(genresPage.navigator.tree.genreLinks).toHaveCount(2, { timeout: 20 * 1000 })
//       })
//     })
//   })

//   test.describe('with EDIT_GENRES permission', () => {
//     test.beforeAll(async () => {
//       await createAccounts([{ ...TEST_ACCOUNT, permissions: ['EDIT_GENRES'] }])
//     })

//     test.afterAll(async () => {
//       await deleteAccounts([TEST_ACCOUNT.username])
//     })

//     test.beforeEach(async ({ signInPage }) => {
//       await signInPage.goto()
//       await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)
//       await signInPage.page.waitForURL(GenresPage.url)
//     })

//     test('should show genre settings button', async ({ genresPage }) => {
//       await expect(genresPage.navigator.settingsButton).toBeVisible()
//     })

//     test.describe('when there are no existing genres', () => {
//       test('should show empty state when searching with CTA to create a genre', async ({
//         genresPage,
//       }) => {
//         await genresPage.navigator.search.input.fill('a')
//         await expect(genresPage.navigator.tree.emptyState).toBeVisible()
//         await expect(genresPage.navigator.tree.createGenreLink).toBeVisible()
//         await genresPage.navigator.tree.createGenreLink.click()
//         await expect(genresPage.page).toHaveURL(CreateGenrePage.url)
//       })
//     })

//     test.describe('when there are existing genres', () => {
//       test.beforeAll(async () => {
//         await createGenres()
//       })

//       test.afterAll(async () => {
//         await deleteGenres()
//       })

//       test('should show genre links in tree', async ({ genresPage }) => {
//         await expect(genresPage.navigator.tree.genreLinks).toHaveCount(2, { timeout: 20 * 1000 })
//       })
//     })
//   })
// })
