import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { writable } from 'svelte/store'
import { expect, it, test } from 'vitest'

import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'

import {
  createGenreTreeStore,
  GENRE_TREE_STORE_KEY,
  type TreeGenre,
} from '../../../routes/genres/genre-tree-store.svelte'
import RomcodeGenreLink from './RomcodeGenreLink.svelte'

const setup = (
  props: ComponentProps<typeof RomcodeGenreLink>,
  options: { userSettings?: Partial<UserSettings>; genres?: TreeGenre[] } = {},
) => {
  const returned = render(RomcodeGenreLink, {
    props,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: new Map<any, any>([
      [
        USER_SETTINGS_CONTEXT_KEY,
        writable<UserSettings>({ ...DEFAULT_USER_SETTINGS, ...options.userSettings }),
      ],
      [GENRE_TREE_STORE_KEY, createGenreTreeStore(options.genres ?? [])],
    ]),
  })

  const user = userEvent.setup()

  return {
    ...returned,
    user,
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
    derivedFrom: [],
    relevance: 1,
    updatedAt: new Date(),

    ...data,
  }
}

test('renders just the genre name for non-nsfw genres', () => {
  const { getByRole, queryByTestId } = setup(
    {
      id: 1,
    },
    {
      genres: [createExampleGenre({ id: 1, name: 'Genre Name', nsfw: false })],
    },
  )

  expect(getByRole('link')).toHaveTextContent('Genre Name')
  expect(queryByTestId('nsfw-indicator')).toBeNull()
})

it('renders just the override text for non-nsfw genres', () => {
  const { getByRole, queryByTestId } = setup(
    {
      id: 1,
      text: 'Override Text',
    },
    {
      genres: [createExampleGenre({ id: 1, name: 'Genre Name', nsfw: false })],
    },
  )

  expect(getByRole('link')).toHaveTextContent('Override Text')
  expect(queryByTestId('nsfw-indicator')).toBeNull()
})

it('renders the genre name with an nsfw indicator for nsfw genres', () => {
  const { getByRole, getByTestId } = setup(
    {
      id: 1,
    },
    {
      genres: [createExampleGenre({ id: 1, name: 'Genre Name', nsfw: true })],
    },
  )

  expect(getByRole('link')).toHaveTextContent('Genre Name')
  expect(getByTestId('nsfw-indicator')).toBeVisible()
})

it('renders the override text with an nsfw indicator for nsfw genres', () => {
  const { getByRole, getByTestId } = setup(
    {
      id: 1,
      text: 'Override Text',
    },
    {
      genres: [createExampleGenre({ id: 1, name: 'Genre Name', nsfw: true })],
    },
  )

  expect(getByRole('link')).toHaveTextContent('Override Text')
  expect(getByTestId('nsfw-indicator')).toBeVisible()
})
