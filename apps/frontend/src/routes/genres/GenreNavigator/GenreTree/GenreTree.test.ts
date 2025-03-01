import { getByRole, queryByRole, render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { readable, writable } from 'svelte/store'
import { expect, it } from 'vitest'

import { USER_CONTEXT_KEY } from '$lib/contexts/user'
import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'
import { withProps } from '$lib/utils/object'

import GenreTree from './GenreTree.svelte'
import { createTreeState, TREE_STATE_KEY, type TreeGenre } from './state'

function setup(
  props: ComponentProps<typeof GenreTree>,
  context: { user: App.Locals['user'] | undefined; userSettings?: Partial<UserSettings> },
) {
  const user = userEvent.setup()
  const renderedComponent = renderComponent(props, context)
  const componentModel = createComponentModel(renderedComponent)

  return {
    user,
    ...renderedComponent,
    ...componentModel,
  }
}

function renderComponent(
  props: ComponentProps<typeof GenreTree>,
  context: { user: App.Locals['user'] | undefined; userSettings?: Partial<UserSettings> },
) {
  return render(GenreTree, {
    props,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: new Map<any, any>([
      [USER_CONTEXT_KEY, readable(context.user)],
      [
        USER_SETTINGS_CONTEXT_KEY,
        writable<UserSettings>({ ...DEFAULT_USER_SETTINGS, ...context.userSettings }),
      ],
      [TREE_STATE_KEY, createTreeState()],
    ]),
  })
}

function createComponentModel(renderedComponent: ReturnType<typeof renderComponent>) {
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
    children: [],
    derivedFrom: [],
    derivations: [],
    relevance: 1,
    updatedAt: new Date(),

    ...data,
  }
}

it('should show an empty state when there are no genres', () => {
  const { emptyState } = setup({ genres: [] }, { user: undefined })

  expect(emptyState.get()).toBeVisible()
})

it('should not show an empty state when there is one genre', () => {
  const { emptyState } = setup({ genres: [createExampleGenre()] }, { user: undefined })

  expect(emptyState.query()).toBeNull()
})

it('should not show a create genre CTA when the user is not logged in', () => {
  const { createGenreLink } = setup({ genres: [] }, { user: undefined })

  expect(createGenreLink.query()).toBeNull()
})

it('should not show a create genre CTA when the user is logged in but does not have create genre permission', () => {
  const { createGenreLink } = setup(
    { genres: [] },
    {
      user: {
        id: 0,
        username: 'test-user',
        permissions: {
          genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
        },
      },
    },
  )

  expect(createGenreLink.query()).toBeNull()
})

it('should show a create genre CTA when the user has create genre permission', () => {
  const { createGenreLink } = setup(
    { genres: [] },
    {
      user: {
        id: 0,
        username: 'test-user',
        permissions: {
          genres: { canCreate: true, canEdit: false, canDelete: false, canVoteRelevance: false },
        },
      },
    },
  )

  expect(createGenreLink.get()).toBeVisible()
})

it('should not be expandable when there is 1 genre', () => {
  const { genreNode } = setup(
    { genres: [createExampleGenre()] },
    {
      user: {
        id: 0,
        username: 'test-user',
        permissions: {
          genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
        },
      },
    },
  )

  expect(genreNode.get().expandButton.query()).toBeNull()
})

it('should show an expand button for a parent genre but not a leaf genre', async () => {
  const { user, genreNode } = setup(
    {
      genres: [
        createExampleGenre({ id: 0, children: [1], name: 'Parent' }),
        createExampleGenre({ id: 1, parents: [0], name: 'Child' }),
      ],
    },
    {
      user: {
        id: 0,
        username: 'test-user',
        permissions: {
          genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
        },
      },
    },
  )

  const parentNode = genreNode.get(0)
  const parentExpandButton = parentNode.expandButton.get()
  await user.click(parentExpandButton)

  const childNode = genreNode.get(1)
  const childExpandButton = childNode.expandButton.query()
  expect(childExpandButton).toBeNull()
})

it('should expand a genre when clicking the link rather than the expand button', async () => {
  const { user, genreNode } = setup(
    {
      genres: [
        createExampleGenre({ id: 0, children: [1], name: 'Parent' }),
        createExampleGenre({ id: 1, parents: [0], name: 'Child' }),
      ],
    },
    {
      user: {
        id: 0,
        username: 'test-user',
        permissions: {
          genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
        },
      },
    },
  )

  const parentNode = genreNode.get(0)
  await user.click(parentNode.link.get())

  const childNode = genreNode.get(1)
  expect(childNode).toBeVisible()
})

it('should show the collapse all button when a genre is expanded', async () => {
  const { user, collapseAllButton, genreNode } = setup(
    {
      genres: [
        createExampleGenre({ id: 0, children: [1] }),
        createExampleGenre({ id: 1, parents: [0] }),
      ],
    },
    {
      user: {
        id: 0,
        username: 'test-user',
        permissions: {
          genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
        },
      },
    },
  )

  expect(collapseAllButton.query()).toBeNull()

  await user.click(genreNode.get().expandButton.get())

  expect(collapseAllButton.get()).toBeVisible()
})

it('should collapse all genres upon clicking the collapse all button', async () => {
  const { user, collapseAllButton, genreNode } = setup(
    {
      genres: [
        createExampleGenre({ id: 0, children: [1], name: 'Parent' }),
        createExampleGenre({ id: 1, parents: [0], name: 'Child' }),
      ],
    },
    {
      user: {
        id: 0,
        username: 'test-user',
        permissions: {
          genres: { canCreate: false, canEdit: false, canDelete: false, canVoteRelevance: false },
        },
      },
    },
  )

  await user.click(genreNode.get(0).expandButton.get())
  expect(genreNode.get(1)).toBeVisible()

  await user.click(collapseAllButton.get())

  expect(genreNode.query(1)).toBeNull()
})
