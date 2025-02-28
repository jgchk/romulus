import { getByRole, queryByRole, render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { readable, writable } from 'svelte/store'
import { expect, it } from 'vitest'

import { USER_CONTEXT_KEY } from '$lib/contexts/user'
import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'

import GenreTree from './GenreTree.svelte'
import { createTreeState, TREE_STATE_KEY, type TreeGenre } from './state'

function setup(
  props: ComponentProps<typeof GenreTree>,
  context: { user: App.Locals['user'] | undefined; userSettings?: Partial<UserSettings> },
) {
  const user = userEvent.setup()

  const returned = render(GenreTree, {
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

  return {
    user,
    ...returned,
  }
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
  const { getByText } = setup({ genres: [] }, { user: undefined })

  const emptyState = getByText('No genres found.')
  expect(emptyState).toBeVisible()
})

it('should not show an empty state when there is one genre', () => {
  const { queryByText } = setup({ genres: [createExampleGenre()] }, { user: undefined })

  const emptyState = queryByText('No genres found.')
  expect(emptyState).toBeNull()
})

it('should not show a create genre CTA when the user is not logged in', () => {
  const { queryByRole } = setup({ genres: [] }, { user: undefined })

  const createGenreLink = queryByRole('link', { name: 'Create one.' })
  expect(createGenreLink).toBeNull()
})

it('should not show a create genre CTA when the user is logged in but does not have create genre permission', () => {
  const { queryByRole } = setup(
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

  const createGenreLink = queryByRole('link', { name: 'Create one.' })
  expect(createGenreLink).toBeNull()
})

it('should show a create genre CTA when the user has create genre permission', () => {
  const { getByRole } = setup(
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

  const createGenreLink = getByRole('link', { name: 'Create one.' })
  expect(createGenreLink).toBeVisible()
})

it('should not be expandable when there is 1 genre', () => {
  const { getByLabelText } = setup(
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

  const node = getByLabelText('Genre Tree').querySelector('.genre-tree-node')
  if (node === null) expect.fail('Expected a genre tree node to exist')
  if (!(node instanceof HTMLElement)) expect.fail('Expected genre tree node to be an HTMLElement')

  const expandButton = queryByRole(node, 'button', { name: 'Expand' })
  expect(expandButton).toBeNull()
})

it('should show an expand button for a parent genre but not a leaf genre', async () => {
  const { getByLabelText, findByLabelText, user } = setup(
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

  const parentNode = getByLabelText('Genre Tree').querySelector('.genre-tree-node')
  if (parentNode === null) expect.fail('Expected parent genre tree node to exist')
  if (!(parentNode instanceof HTMLElement))
    expect.fail('Expected parent genre tree node to be an HTMLElement')

  const parentExpandButton = getByRole(parentNode, 'button', { name: 'Expand' })
  await user.click(parentExpandButton)

  const childNode = (await findByLabelText('Genre Tree')).querySelector(
    '.genre-tree-node:nth-child(1)',
  )
  if (childNode === null) expect.fail('Expected child genre tree node to exist')
  if (!(childNode instanceof HTMLElement))
    expect.fail('Expected child genre tree node to be an HTMLElement')

  const childExpandButton = queryByRole(childNode, 'button', { name: 'Expand' })
  expect(childExpandButton).toBeNull()
})

it('should show the collapse all button when a genre is expanded', async () => {
  const { queryByRole, getByRole, user } = setup(
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

  expect(queryByRole('button', { name: 'Collapse All' })).toBeNull()

  const expandButton = getByRole('button', { name: 'Expand' })
  await user.click(expandButton)

  expect(getByRole('button', { name: 'Collapse All' })).toBeVisible()
})
