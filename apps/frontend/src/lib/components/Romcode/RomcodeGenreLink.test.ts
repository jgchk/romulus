import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { writable } from 'svelte/store'
import { expect, it, test } from 'vitest'

import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'
import { createGenreStore } from '$lib/features/genres/queries/infrastructure'
import { createExampleGenre } from '$lib/features/genres/queries/types'

import RomcodeGenreLink from './RomcodeGenreLink.svelte'

const setup = (
  props: ComponentProps<typeof RomcodeGenreLink>,
  options: { userSettings?: Partial<UserSettings> } = {},
) => {
  const returned = render(RomcodeGenreLink, {
    props,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: new Map<any, any>([
      [
        USER_SETTINGS_CONTEXT_KEY,
        writable<UserSettings>({ ...DEFAULT_USER_SETTINGS, ...options.userSettings }),
      ],
    ]),
  })

  const user = userEvent.setup()

  return {
    ...returned,
    user,
  }
}

test('renders just the genre name for non-nsfw genres', () => {
  const { getByRole, queryByTestId } = setup({
    id: 1,
    genres: createGenreStore([createExampleGenre({ id: 1, name: 'Genre Name', nsfw: false })]),
  })

  expect(getByRole('link')).toHaveTextContent('Genre Name')
  expect(queryByTestId('nsfw-indicator')).toBeNull()
})

it('renders just the override text for non-nsfw genres', () => {
  const { getByRole, queryByTestId } = setup({
    id: 1,
    text: 'Override Text',
    genres: createGenreStore([createExampleGenre({ id: 1, name: 'Genre Name', nsfw: false })]),
  })

  expect(getByRole('link')).toHaveTextContent('Override Text')
  expect(queryByTestId('nsfw-indicator')).toBeNull()
})

it('renders the genre name with an nsfw indicator for nsfw genres', () => {
  const { getByRole, getByTestId } = setup({
    id: 1,
    genres: createGenreStore([createExampleGenre({ id: 1, name: 'Genre Name', nsfw: true })]),
  })

  expect(getByRole('link')).toHaveTextContent('Genre Name')
  expect(getByTestId('nsfw-indicator')).toBeVisible()
})

it('renders the override text with an nsfw indicator for nsfw genres', () => {
  const { getByRole, getByTestId } = setup({
    id: 1,
    text: 'Override Text',
    genres: createGenreStore([createExampleGenre({ id: 1, name: 'Genre Name', nsfw: true })]),
  })

  expect(getByRole('link')).toHaveTextContent('Override Text')
  expect(getByTestId('nsfw-indicator')).toBeVisible()
})
