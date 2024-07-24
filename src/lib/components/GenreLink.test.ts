import { render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { expect, it } from 'vitest'

import { userSettings } from '$lib/contexts/user-settings'

import GenreLink from './GenreLink.svelte'

function setup(props: ComponentProps<GenreLink>) {
  const user = userEvent.setup()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const returned = render(GenreLink, props)

  return {
    user,
    ...returned,
  }
}

it('should be blurred and show a tooltip if the genre is NSFW and showNsfw is false', async () => {
  userSettings.update((prev) => ({ ...prev, showNsfw: false }))

  const { getByRole, user } = setup({
    id: 0,
    name: 'Test',
    nsfw: true,
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

it('should not be blurred and not show a tooltip if the genre is NSFW and showNsfw is true', async () => {
  userSettings.update((prev) => ({ ...prev, showNsfw: true }))

  const { getByRole, queryByRole, user } = setup({
    id: 0,
    name: 'Test',
    nsfw: true,
  })

  const link = getByRole('link')
  expect(link).not.toHaveClass('blur-sm')

  await user.hover(link)
  await waitFor(() => {
    expect(queryByRole('tooltip')).toBeNull()
  })
})

it('should not be blurred and not show a tooltip if the genre is not NSFW', async () => {
  userSettings.update((prev) => ({ ...prev, showNsfw: false }))

  const { getByRole, queryByRole, user } = setup({
    id: 0,
    name: 'Test',
    nsfw: false,
  })

  const link = getByRole('link')
  expect(link).not.toHaveClass('blur-sm')

  await user.hover(link)
  await waitFor(() => {
    expect(queryByRole('tooltip')).toBeNull()
  })
})
