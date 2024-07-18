import { render } from '@testing-library/svelte'
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
  treeGenreId: 0,
  createdAt: new Date(),
  operation: 'DELETE' as const,
  account: {
    id: 0,
    username: 'Username',
  },
}

function setup() {
  return render(GenreDiff, {
    previousHistory: undefined,
    currentHistory: mockHistory,
    genres: Promise.resolve([]),
  })
}

it('should show the genre operation', () => {
  const { getByTestId } = setup()
  expect(getByTestId('genre-diff-operation')).toHaveTextContent('Delete')
})

it('should show the account who made the operation', () => {
  const { getByTestId } = setup()
  const usernameLink = getByTestId('genre-diff-account')
  expect(usernameLink).toHaveTextContent('Username')
  expect(usernameLink).toHaveAttribute('href', '/accounts/0')
})

it('should show the time since the operation', () => {
  const { getByTestId } = setup()
  expect(getByTestId('genre-diff-time')).toHaveTextContent('0s')
})
