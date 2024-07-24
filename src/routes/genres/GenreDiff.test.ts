import { render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { expect, it } from 'vitest'

import { userSettings } from '$lib/contexts/user-settings'

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

function setup(props: ComponentProps<GenreDiff>) {
  const user = userEvent.setup()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const rendered = render(GenreDiff, props)
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
  userSettings.update((prev) => ({ ...prev, showNsfw: false }))

  const { user, getByTestId, getByRole } = setup({
    previousHistory: { ...mockHistory, nsfw: false, operation: 'CREATE' },
    currentHistory: { ...mockHistory, nsfw: true, operation: 'UPDATE' },
    genres: Promise.resolve([]),
  })

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
  userSettings.update((prev) => ({ ...prev, showNsfw: true }))

  const { user, getByTestId, queryByRole } = setup({
    previousHistory: { ...mockHistory, nsfw: false, operation: 'CREATE' },
    currentHistory: { ...mockHistory, nsfw: true, operation: 'UPDATE' },
    genres: Promise.resolve([]),
  })

  const el = getByTestId('genre-diff')
  expect(el).not.toHaveClass('blur-sm')

  await user.hover(getByTestId('genre-diff'))
  await waitFor(() => {
    expect(queryByRole('tooltip')).toBeNull()
  })
})

it('should not blur the diff when the genre is not NSFW', async () => {
  userSettings.update((prev) => ({ ...prev, showNsfw: false }))

  const { user, getByTestId, queryByRole } = setup({
    previousHistory: { ...mockHistory, nsfw: false, operation: 'CREATE' },
    currentHistory: { ...mockHistory, nsfw: false, operation: 'UPDATE' },
    genres: Promise.resolve([]),
  })

  const el = getByTestId('genre-diff')
  expect(el).not.toHaveClass('blur-sm')

  await user.hover(getByTestId('genre-diff'))
  await waitFor(() => {
    expect(queryByRole('tooltip')).toBeNull()
  })
})
