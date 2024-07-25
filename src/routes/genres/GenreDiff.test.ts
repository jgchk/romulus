import { render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { writable } from 'svelte/store'
import { expect, it } from 'vitest'

import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'

import GenreDiff from './GenreDiff.svelte'

const mockHistory = {
  name: 'Test',
  subtitle: 'Subtitle',
  type: 'STYLE' as const,
  akas: ['AKA'],
  shortDescription: 'A short description.',
  longDescription: 'A long description.',
  notes: 'Some notes.',
  parentGenreIds: [1],
  influencedByGenreIds: [1],
  nsfw: false,
  treeGenreId: 0,
  createdAt: new Date(),
  operation: 'DELETE' as const,
  account: {
    id: 0,
    username: 'Username',
  },
}

function setup(
  props: ComponentProps<GenreDiff>,
  options: { userSettings?: Partial<UserSettings> } = {},
) {
  const user = userEvent.setup()
  const rendered = render(GenreDiff, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    props,
    context: new Map([
      [
        USER_SETTINGS_CONTEXT_KEY,
        writable<UserSettings>({ ...DEFAULT_USER_SETTINGS, ...options.userSettings }),
      ],
    ]),
  })
  return { ...rendered, user }
}

it('should show the genre operation', () => {
  const { getByTestId } = setup({
    previousHistory: undefined,
    currentHistory: mockHistory,
    genres: Promise.resolve([]),
  })
  expect(getByTestId('genre-diff-operation')).toHaveTextContent('Delete')
})

it('should show the account who made the operation', () => {
  const { getByTestId } = setup({
    previousHistory: undefined,
    currentHistory: mockHistory,
    genres: Promise.resolve([]),
  })
  const usernameLink = getByTestId('genre-diff-account')
  expect(usernameLink).toHaveTextContent('Username')
  expect(usernameLink).toHaveAttribute('href', '/accounts/0')
})

it('should show the time since the operation', () => {
  const { getByTestId } = setup({
    previousHistory: undefined,
    currentHistory: mockHistory,
    genres: Promise.resolve([]),
  })
  expect(getByTestId('genre-diff-time')).toHaveTextContent('0s')
})

it('should include NSFW status when it is changed to true', () => {
  const { getByTestId } = setup({
    previousHistory: { ...mockHistory, nsfw: false, operation: 'CREATE' },
    currentHistory: { ...mockHistory, nsfw: true, operation: 'UPDATE' },
    genres: Promise.resolve([]),
  })
  expect(getByTestId('genre-diff-nsfw')).toHaveTextContent('True')
})

it('should include NSFW status when it is changed to false', () => {
  const { getByTestId } = setup({
    previousHistory: { ...mockHistory, nsfw: true, operation: 'CREATE' },
    currentHistory: { ...mockHistory, nsfw: false, operation: 'UPDATE' },
    genres: Promise.resolve([]),
  })
  expect(getByTestId('genre-diff-nsfw')).toHaveTextContent('False')
})

it('should blur the diff when the genre is NSFW and showNsfw is false', async () => {
  const { user, getByTestId, getByRole } = setup(
    {
      previousHistory: { ...mockHistory, nsfw: false, operation: 'CREATE' },
      currentHistory: { ...mockHistory, nsfw: true, operation: 'UPDATE' },
      genres: Promise.resolve([]),
    },
    { userSettings: { showNsfw: false } },
  )

  const el = getByTestId('genre-diff')
  expect(el).toHaveClass('blur-sm')

  await user.hover(getByTestId('genre-diff'))
  await waitFor(() => {
    expect(getByRole('tooltip')).toHaveTextContent(
      'Enable NSFW genres in settings to view this genre',
    )
  })
})

it('should not blur the diff when the genre is NSFW and showNsfw is true', async () => {
  const { user, getByTestId, queryByRole } = setup(
    {
      previousHistory: { ...mockHistory, nsfw: false, operation: 'CREATE' },
      currentHistory: { ...mockHistory, nsfw: true, operation: 'UPDATE' },
      genres: Promise.resolve([]),
    },
    { userSettings: { showNsfw: true } },
  )

  const el = getByTestId('genre-diff')
  expect(el).not.toHaveClass('blur-sm')

  await user.hover(getByTestId('genre-diff'))
  await waitFor(() => {
    expect(queryByRole('tooltip')).toBeNull()
  })
})

it('should not blur the diff when the genre is not NSFW', async () => {
  const { user, getByTestId, queryByRole } = setup(
    {
      previousHistory: { ...mockHistory, nsfw: false, operation: 'CREATE' },
      currentHistory: { ...mockHistory, nsfw: false, operation: 'UPDATE' },
      genres: Promise.resolve([]),
    },
    { userSettings: { showNsfw: false } },
  )

  const el = getByTestId('genre-diff')
  expect(el).not.toHaveClass('blur-sm')

  await user.hover(getByTestId('genre-diff'))
  await waitFor(() => {
    expect(queryByRole('tooltip')).toBeNull()
  })
})
