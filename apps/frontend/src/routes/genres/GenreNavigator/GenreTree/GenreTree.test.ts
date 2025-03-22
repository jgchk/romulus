import { QueryClient } from '@tanstack/svelte-query'
import { findByRole, getByRole, queryByRole, render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { readable, writable } from 'svelte/store'
import { expect, it } from 'vitest'

import { USER_CONTEXT_KEY } from '$lib/contexts/user'
import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'
import { createGenreDatabaseApplication } from '$lib/genre-db/application'
import { createGenreDatabase } from '$lib/genre-db/infrastructure/db'
import { withProps } from '$lib/utils/object'

import {
  createGenreTreeStore,
  GENRE_TREE_STORE_KEY,
  type TreeGenre,
} from '../../genre-tree-store.svelte'
import { createTreeStateStore, TREE_STATE_STORE_KEY } from '../../tree-state-store.svelte'
import GenreTree from './GenreTree.svelte'

async function setup(context: {
  user: App.Locals['user'] | undefined
  userSettings?: Partial<UserSettings>
  genres?: TreeGenre[]
}) {
  const user = userEvent.setup()
  const renderedComponent = await renderComponent(context)
  const componentModel = createComponentModel(renderedComponent)

  return {
    user,
    ...renderedComponent,
    ...componentModel,
  }
}

async function renderComponent(context: {
  user: App.Locals['user'] | undefined
  userSettings?: Partial<UserSettings>
  genres?: TreeGenre[]
}) {
  const genres = context.genres ?? []

  const genreDatabase = await createGenreDatabase(new IDBFactory())
  const app = createGenreDatabaseApplication(genreDatabase)
  await app.seedGenres(genres)

  return render(GenreTree, {
    props: { genreDatabase },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: new Map<any, any>([
      [USER_CONTEXT_KEY, readable(context.user)],
      [
        USER_SETTINGS_CONTEXT_KEY,
        writable<UserSettings>({ ...DEFAULT_USER_SETTINGS, ...context.userSettings }),
      ],
      [TREE_STATE_STORE_KEY, createTreeStateStore()],
      [GENRE_TREE_STORE_KEY, createGenreTreeStore(genres)],
      [
        '$$_queryClient',
        new QueryClient({
          defaultOptions: {
            queries: {
              retry: false,
            },
          },
        }),
      ],
    ]),
  })
}

function createComponentModel(renderedComponent: Awaited<ReturnType<typeof renderComponent>>) {
  const emptyState = {
    get: () => renderedComponent.getByText('No genres found.'),
    query: () => renderedComponent.queryByText('No genres found.'),
  }

  const createGenreLink = {
    get: () => renderedComponent.getByRole('link', { name: 'Create one.' }),
    query: () => renderedComponent.queryByRole('link', { name: 'Create one.' }),
  }

  const genreNode = {
    get: (index = 0) => {
      const nodes = renderedComponent
        .getByLabelText('Genre Tree')
        .querySelectorAll('.genre-tree-node')
      const node = nodes[index]

      if (!node) {
        expect.fail(`Expected a genre tree node to exist at index ${index}`)
      }
      if (!(node instanceof HTMLElement)) {
        expect.fail(`Expected genre tree node to be an HTMLElement at index ${index}`)
      }

      return withProps(node, {
        expandButton: {
          get: () => getByRole(node, 'button', { name: 'Expand' }),
          find: () => findByRole(node, 'button', { name: 'Expand' }),
          query: () => queryByRole(node, 'button', { name: 'Expand' }),
        },
        link: {
          get: () => getByRole(node, 'link'),
        },
      })
    },
    query: (index = 0) => {
      const nodes = renderedComponent
        .getByLabelText('Genre Tree')
        .querySelectorAll('.genre-tree-node')
      const node = nodes[index]

      if (!node) {
        return null
      }
      if (!(node instanceof HTMLElement)) {
        expect.fail(`Expected genre tree node to be an HTMLElement at index ${index}`)
      }

      return withProps(node, {
        expandButton: {
          get: () => getByRole(node, 'button', { name: 'Expand' }),
          query: () => queryByRole(node, 'button', { name: 'Expand' }),
        },
        link: {
          get: () => getByRole(node, 'link'),
        },
      })
    },
  }

  const collapseAllButton = {
    get: () => renderedComponent.getByRole('button', { name: 'Collapse All' }),
    query: () => renderedComponent.queryByRole('button', { name: 'Collapse All' }),
  }

  return { emptyState, createGenreLink, genreNode, collapseAllButton }
}

function createExampleGenre(data?: Partial<TreeGenre>): TreeGenre {
  return {
    id: 0,
    name: 'Test Genre',
    subtitle: null,
    type: 'STYLE',
    akas: [],
    nsfw: false,
    parents: [],
    derivedFrom: [],
    relevance: 1,
    updatedAt: new Date(),

    ...data,
  }
}

it('should show an empty state when there are no genres', async () => {
  const { emptyState } = await setup({ user: undefined, genres: [] })

  await waitFor(() => {
    expect(emptyState.get()).toBeVisible()
  })
})

it('should not show an empty state when there is one genre', async () => {
  const { emptyState } = await setup({ user: undefined, genres: [createExampleGenre()] })

  await waitFor(() => {
    expect(emptyState.query()).toBeNull()
  })
})

it('should not show a create genre CTA when the user is not logged in', async () => {
  const { emptyState, createGenreLink } = await setup({ user: undefined, genres: [] })

  await waitFor(() => {
    expect(emptyState.get()).toBeVisible()
    expect(createGenreLink.query()).toBeNull()
  })
})

it('should not show a create genre CTA when the user is logged in but does not have create genre permission', async () => {
  const { emptyState, createGenreLink } = await setup({
    user: {
      id: 0,
      username: 'test-user',
      permissions: {
        genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
      },
    },
    genres: [],
  })

  await waitFor(() => {
    expect(emptyState.get()).toBeVisible()
    expect(createGenreLink.query()).toBeNull()
  })
})

it('should show a create genre CTA when the user has create genre permission', async () => {
  const { emptyState, createGenreLink } = await setup({
    user: {
      id: 0,
      username: 'test-user',
      permissions: {
        genres: { canCreate: true, canEdit: false, canDelete: false, canVoteRelevance: false },
      },
    },
    genres: [],
  })

  await waitFor(() => {
    expect(emptyState.get()).toBeVisible()
    expect(createGenreLink.get()).toBeVisible()
  })
})

it('should not be expandable when there is 1 genre', async () => {
  const { genreNode } = await setup({
    user: {
      id: 0,
      username: 'test-user',
      permissions: {
        genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
      },
    },
    genres: [createExampleGenre()],
  })

  await waitFor(() => {
    expect(genreNode.get().expandButton.query()).toBeNull()
  })
})

it('should show an expand button for a parent genre but not a leaf genre', async () => {
  const { user, genreNode } = await setup({
    user: {
      id: 0,
      username: 'test-user',
      permissions: {
        genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
      },
    },
    genres: [
      createExampleGenre({ id: 0, name: 'Parent' }),
      createExampleGenre({ id: 1, parents: [0], name: 'Child' }),
    ],
  })

  const parentNode = await waitFor(() => genreNode.get(0))
  const parentExpandButton = await parentNode.expandButton.find()
  await user.click(parentExpandButton)

  const childNode = await waitFor(() => genreNode.get(1))
  const childExpandButton = childNode.expandButton.query()
  expect(childExpandButton).toBeNull()
})

it('should expand a genre when clicking the link rather than the expand button', async () => {
  const { user, genreNode } = await setup({
    user: {
      id: 0,
      username: 'test-user',
      permissions: {
        genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
      },
    },
    genres: [
      createExampleGenre({ id: 0, name: 'Parent' }),
      createExampleGenre({ id: 1, parents: [0], name: 'Child' }),
    ],
  })

  const parentNode = await waitFor(() => genreNode.get(0))
  await user.click(parentNode.link.get())

  const childNode = await waitFor(() => genreNode.get(1))
  expect(childNode).toBeVisible()
})

it('should show the collapse all button when a genre is expanded', async () => {
  const { user, collapseAllButton, genreNode } = await setup({
    user: {
      id: 0,
      username: 'test-user',
      permissions: {
        genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
      },
    },
    genres: [createExampleGenre({ id: 0 }), createExampleGenre({ id: 1, parents: [0] })],
  })

  await waitFor(() => genreNode.get(0))

  expect(collapseAllButton.query()).toBeNull()

  await user.click(await genreNode.get().expandButton.find())

  expect(collapseAllButton.get()).toBeVisible()
})

it('should collapse all genres upon clicking the collapse all button', async () => {
  const { user, collapseAllButton, genreNode } = await setup({
    user: {
      id: 0,
      username: 'test-user',
      permissions: {
        genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
      },
    },
    genres: [
      createExampleGenre({ id: 0, name: 'Parent' }),
      createExampleGenre({ id: 1, parents: [0], name: 'Child' }),
    ],
  })

  await waitFor(() => genreNode.get(0))

  await user.click(await genreNode.get(0).expandButton.find())
  await waitFor(() => {
    expect(genreNode.get(1)).toBeVisible()
  })

  await user.click(collapseAllButton.get())

  expect(genreNode.query(1)).toBeNull()
})

it('should open the genre page when clicking a genre link', async () => {
  const { user, genreNode } = await setup({
    user: {
      id: 0,
      username: 'test-user',
      permissions: {
        genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
      },
    },
    genres: [createExampleGenre({ id: 0 })],
  })

  await waitFor(() => genreNode.get(0))

  window.location.href = '/genres'

  await user.click(genreNode.get().link.get())

  expect(window.location.pathname).toBe('/genres/0')
})
