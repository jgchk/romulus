import { render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { expect, it } from 'vitest'

import { userSettings } from '$lib/contexts/user-settings'

import GenreSearchResult from './GenreSearchResult.svelte'

function setup(props: ComponentProps<GenreSearchResult>) {
  const user = userEvent.setup()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const returned = render(GenreSearchResult, props)

  return {
    user,
    ...returned,
  }
}

it('should be blurred when the genre is NSFW and the showNsfw setting is off', async () => {
  userSettings.update((prev) => ({ ...prev, showNsfw: false }))

  const { user, getByRole } = setup({
    match: {
      id: 0,
      weight: 0.25,
      genre: {
        id: 0,
        name: 'Test',
        type: 'STYLE',
        subtitle: null,
        nsfw: true,
      },
    },
  })

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
  userSettings.update((prev) => ({ ...prev, showNsfw: true }))

  const { user, getByRole, queryByRole } = setup({
    match: {
      id: 0,
      weight: 0.25,
      genre: {
        id: 0,
        name: 'Test',
        type: 'STYLE',
        subtitle: null,
        nsfw: true,
      },
    },
  })

  const link = getByRole('link')
  expect(link).not.toHaveClass('blur-sm')

  await user.hover(link)
  await waitFor(() => {
    expect(queryByRole('tooltip')).toBeNull()
  })
})

it('should not be blurred when the genre is not NSFW', async () => {
  userSettings.update((prev) => ({ ...prev, showNsfw: false }))

  const { user, getByRole, queryByRole } = setup({
    match: {
      id: 0,
      weight: 0.25,
      genre: {
        id: 0,
        name: 'Test',
        type: 'STYLE',
        subtitle: null,
        nsfw: false,
      },
    },
  })

  const link = getByRole('link')
  expect(link).not.toHaveClass('blur-sm')

  await user.hover(link)
  await waitFor(() => {
    expect(queryByRole('tooltip')).toBeNull()
  })
})
