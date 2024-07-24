import { render } from '@testing-library/svelte'
import type { ComponentProps } from 'svelte'
import { expect, it } from 'vitest'

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return render(GenreDiff, props)
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
