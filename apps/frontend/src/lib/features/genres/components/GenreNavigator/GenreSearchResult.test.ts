import { render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { type ComponentProps } from 'svelte'
import { writable } from 'svelte/store'
import { expect, it } from 'vitest'

import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'

import GenreSearchResult from './GenreSearchResult.svelte'

function setup(
  props: ComponentProps<typeof GenreSearchResult>,
  options: { userSettings?: Partial<UserSettings> } = {},
) {
  const user = userEvent.setup()

  const returned = render(GenreSearchResult, {
    props,
    context: new Map([
      [
        USER_SETTINGS_CONTEXT_KEY,
        writable<UserSettings>({ ...DEFAULT_USER_SETTINGS, ...options.userSettings }),
      ],
    ]),
  })

  return {
    user,
    ...returned,
  }
}

it('should be blurred when the genre is NSFW and the showNsfw setting is off', async () => {
  const { user, getByRole } = setup(
    {
      match: {
        genre: {
          id: 0,
          name: 'Test',
          type: 'STYLE',
          subtitle: null,
          nsfw: true,
        },
      },
    },
    { userSettings: { showNsfw: false } },
  )

  const link = getByRole('link')
  expect(link).toHaveClass('blur-sm')

  await user.hover(link)
  await waitFor(() => {
    expect(getByRole('tooltip')).toHaveTextContent(
      'Enable NSFW genres in settings to view this genre',
    )
  })
})

it('should not be blurred when the genre is NSFW and the showNsfw setting is on', async () => {
  const { user, getByRole, queryByRole } = setup(
    {
      match: {
        genre: {
          id: 0,
          name: 'Test',
          type: 'STYLE',
          subtitle: null,
          nsfw: true,
        },
      },
    },
    { userSettings: { showNsfw: true } },
  )

  const link = getByRole('link')
  expect(link).not.toHaveClass('blur-sm')

  await user.hover(link)
  await waitFor(() => {
    expect(queryByRole('tooltip')).toBeNull()
  })
})

it('should not be blurred when the genre is not NSFW', async () => {
  const { user, getByRole, queryByRole } = setup(
    {
      match: {
        genre: {
          id: 0,
          name: 'Test',
          type: 'STYLE',
          subtitle: null,
          nsfw: false,
        },
      },
    },
    { userSettings: { showNsfw: false } },
  )

  const link = getByRole('link')
  expect(link).not.toHaveClass('blur-sm')

  await user.hover(link)
  await waitFor(() => {
    expect(queryByRole('tooltip')).toBeNull()
  })
})
