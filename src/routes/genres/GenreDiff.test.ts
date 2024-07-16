import { render } from '@testing-library/svelte'
import { expect, it } from 'vitest'

import GenreDiff from './GenreDiff.svelte'

it('should show the genre operation', () => {
  const returned = render(GenreDiff, {
    previousHistory: undefined,
    currentHistory: {
      name: 'Test',
      subtitle: 'Subtitle',
      type: 'STYLE',
      akas: ['AKA'],
      shortDescription: 'A short description.',
      longDescription: 'A long description.',
      notes: 'Some notes.',
      parentGenreIds: [1],
      influencedByGenreIds: [1],
      treeGenreId: 0,
      createdAt: new Date(),
      operation: 'DELETE',
      account: {
        id: 0,
        username: 'Username',
      },
    },
    genres: Promise.resolve([]),
  })

  expect(returned.getByTestId('genre-diff-operation')).toHaveTextContent('Delete')
})

it('should show the account who made the operation', () => {
  const returned = render(GenreDiff, {
    previousHistory: undefined,
    currentHistory: {
      name: 'Test',
      subtitle: 'Subtitle',
      type: 'STYLE',
      akas: ['AKA'],
      shortDescription: 'A short description.',
      longDescription: 'A long description.',
      notes: 'Some notes.',
      parentGenreIds: [1],
      influencedByGenreIds: [1],
      treeGenreId: 0,
      createdAt: new Date(),
      operation: 'DELETE',
      account: {
        id: 0,
        username: 'Username',
      },
    },
    genres: Promise.resolve([]),
  })

  const usernameLink = returned.getByTestId('genre-diff-account')
  expect(usernameLink).toHaveTextContent('Username')
  expect(usernameLink).toHaveAttribute('href', '/accounts/0')
})

it('should show the time since the operation', () => {
  const returned = render(GenreDiff, {
    previousHistory: undefined,
    currentHistory: {
      name: 'Test',
      subtitle: 'Subtitle',
      type: 'STYLE',
      akas: ['AKA'],
      shortDescription: 'A short description.',
      longDescription: 'A long description.',
      notes: 'Some notes.',
      parentGenreIds: [1],
      influencedByGenreIds: [1],
      treeGenreId: 0,
      createdAt: new Date(),
      operation: 'DELETE',
      account: {
        id: 0,
        username: 'Username',
      },
    },
    genres: Promise.resolve([]),
  })

  expect(returned.getByTestId('genre-diff-time')).toHaveTextContent('0s')
})
