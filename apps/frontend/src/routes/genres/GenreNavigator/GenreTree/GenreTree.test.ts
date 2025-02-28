import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { readable, writable } from 'svelte/store'
import { expect, it } from 'vitest'

import { USER_CONTEXT_KEY } from '$lib/contexts/user'
import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'

import GenreTree from './GenreTree.svelte'

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
    ]),
  })

  return {
    user,
    ...returned,
  }
}

it('should show an empty state when there are no genres', () => {
  const { getByText } = setup({ genres: [] }, { user: undefined })

  const emptyState = getByText('No genres found.')
  expect(emptyState).toBeVisible()
})

it('should not show an empty state when there is one genre', () => {
  const { queryByText } = setup(
    {
      genres: [
        {
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
        },
      ],
    },
    { user: undefined },
  )

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
