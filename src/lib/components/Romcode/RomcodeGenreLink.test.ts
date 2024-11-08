import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { writable } from 'svelte/store'
import { expect, it, test } from 'vitest'

import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'

import RomcodeGenreLink from './RomcodeGenreLink.svelte'

const setup = (
  props: ComponentProps<RomcodeGenreLink>,
  options: { userSettings?: Partial<UserSettings> } = {},
) => {
  const returned = render(RomcodeGenreLink, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    props,
    context: new Map([
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
  const { container } = setup({
    id: 1,
    genres: [{ id: 1, name: 'Genre Name', nsfw: false }],
  })

  const renderedText = container.textContent
  expect(renderedText).toBe('Genre Name')
})

it('renders just the override text for non-nsfw genres', () => {
  const { container } = setup({
    id: 1,
    text: 'Override Text',
    genres: [{ id: 1, name: 'Genre Name', nsfw: false }],
  })

  const renderedText = container.textContent
  expect(renderedText).toBe('Override Text')
})

it('renders the genre name with an nsfw indicator for nsfw genres', () => {
  const { container } = setup({
    id: 1,
    genres: [{ id: 1, name: 'Genre Name', nsfw: true }],
  })

  const renderedText = container.textContent
  expect(renderedText).toBe('Genre Name N')
})

it('renders the override text with an nsfw indicator for nsfw genres', () => {
  const { container } = setup({
    id: 1,
    text: 'Override Text',
    genres: [{ id: 1, name: 'Genre Name', nsfw: true }],
  })

  const renderedText = container.textContent
  expect(renderedText).toBe('Override Text N')
})
