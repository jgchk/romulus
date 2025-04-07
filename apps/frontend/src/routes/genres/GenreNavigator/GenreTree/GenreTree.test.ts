import { expect, it } from 'vitest'

import { createGenreStore } from '$lib/features/genres/queries/infrastructure'
import { createExampleGenre } from '$lib/features/genres/queries/types'

import { setup } from './GenreTree.test.utils'

it('should show an empty state when there are no genres', () => {
  const { emptyState } = setup({ genres: createGenreStore([]) })

  expect(emptyState.get()).toBeVisible()
})

it('should not show an empty state when there is one genre', () => {
  const { emptyState } = setup(
    { genres: createGenreStore([createExampleGenre()]) },
    { user: undefined },
  )

  expect(emptyState.query()).toBeNull()
})

it('should not show a create genre CTA when the user is not logged in', () => {
  const { createGenreLink } = setup({ genres: createGenreStore([]) }, { user: undefined })

  expect(createGenreLink.query()).toBeNull()
})

it('should not show a create genre CTA when the user is logged in but does not have create genre permission', () => {
  const { createGenreLink } = setup(
    { genres: createGenreStore([]) },
    {
      user: {
        id: 0,
        username: 'test-user',
        permissions: {
          genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
          mediaTypes: { canCreate: false },
        },
      },
    },
  )

  expect(createGenreLink.query()).toBeNull()
})

it('should show a create genre CTA when the user has create genre permission', () => {
  const { createGenreLink } = setup(
    { genres: createGenreStore([]) },
    {
      user: {
        id: 0,
        username: 'test-user',
        permissions: {
          genres: { canCreate: true, canEdit: false, canDelete: false, canVoteRelevance: false },
          mediaTypes: { canCreate: false },
        },
      },
    },
  )

  expect(createGenreLink.get()).toBeVisible()
})

it('should not be expandable when there is 1 genre', () => {
  const { genreNode } = setup({ genres: createGenreStore([createExampleGenre()]) })

  expect(genreNode.get().expandButton.query()).toBeNull()
})

it('should show an expand button for a parent genre but not a leaf genre', async () => {
  const { user, genreNode } = setup({
    genres: createGenreStore([
      createExampleGenre({ id: 0, name: 'Parent', children: [1] }),
      createExampleGenre({ id: 1, name: 'Child' }),
    ]),
  })

  const parentNode = genreNode.get(0)
  const parentExpandButton = parentNode.expandButton.get()
  await user.click(parentExpandButton)

  const childNode = genreNode.get(1)
  const childExpandButton = childNode.expandButton.query()
  expect(childExpandButton).toBeNull()
})

it('should expand a genre when clicking the link rather than the expand button', async () => {
  const { user, genreNode } = setup({
    genres: createGenreStore([
      createExampleGenre({ id: 0, name: 'Parent', children: [1] }),
      createExampleGenre({ id: 1, name: 'Child' }),
    ]),
  })

  const parentNode = genreNode.get(0)
  await user.click(parentNode.link.get())

  const childNode = genreNode.get(1)
  expect(childNode).toBeVisible()
})

it('should show the collapse all button when a genre is expanded', async () => {
  const { user, collapseAllButton, genreNode } = setup({
    genres: createGenreStore([
      createExampleGenre({ id: 0, children: [1] }),
      createExampleGenre({ id: 1 }),
    ]),
  })

  expect(collapseAllButton.query()).toBeNull()

  await user.click(genreNode.get().expandButton.get())

  expect(collapseAllButton.get()).toBeVisible()
})

it('should collapse all genres upon clicking the collapse all button', async () => {
  const { user, collapseAllButton, genreNode } = setup({
    genres: createGenreStore([
      createExampleGenre({ id: 0, name: 'Parent', children: [1] }),
      createExampleGenre({ id: 1, name: 'Child' }),
    ]),
  })

  await user.click(genreNode.get(0).expandButton.get())
  expect(genreNode.get(1)).toBeVisible()

  await user.click(collapseAllButton.get())

  expect(genreNode.query(1)).toBeNull()
})

it('should open the derived genres upon clicking its expand button', async () => {
  const { user, genreNode, derivedGenresNode } = setup({
    genres: createGenreStore([
      createExampleGenre({ id: 0, derivations: [1] }),
      createExampleGenre({ id: 1 }),
    ]),
  })

  await user.click(genreNode.get(0).expandButton.get())

  const derivedGenres = derivedGenresNode.get()
  expect(derivedGenres).toBeVisible()

  await user.click(derivedGenres.expandButton.get())

  expect(genreNode.get(1)).toBeVisible()
})

it('should open the derived genres upon clicking its name', async () => {
  const { user, genreNode, derivedGenresNode } = setup({
    genres: createGenreStore([
      createExampleGenre({ id: 0, derivations: [1] }),
      createExampleGenre({ id: 1 }),
    ]),
  })

  await user.click(genreNode.get(0).expandButton.get())

  const derivedGenres = derivedGenresNode.get()
  expect(derivedGenres).toBeVisible()

  await user.click(derivedGenres.name.get())

  expect(genreNode.get(1)).toBeVisible()
})

it('should open the genre page when clicking a genre link', async () => {
  const { user, genreNode } = setup({ genres: createGenreStore([createExampleGenre({ id: 0 })]) })

  window.location.href = '/genres'

  await user.click(genreNode.get().link.get())

  expect(window.location.pathname).toBe('/genres/0')
})

it('should not show derived genres at the root level', () => {
  const { genreNode } = setup({
    genres: createGenreStore([
      createExampleGenre({ id: 0, name: 'Zero', derivations: [1] }),
      createExampleGenre({ id: 1, name: 'One' }),
    ]),
  })

  const rootGenre = genreNode.get(0)
  expect(rootGenre).toBeVisible()
  expect(rootGenre).toHaveTextContent('Zero')

  const derivedGenre = genreNode.query(1)
  expect(derivedGenre).toBeNull()
})
