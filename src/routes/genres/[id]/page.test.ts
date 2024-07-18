import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { expect, it } from 'vitest'

import GenrePage from './+page.svelte'
import { relevanceVoteSchema } from './utils'

function setup(props: ComponentProps<GenrePage>) {
  const user = userEvent.setup()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const returned = render(GenrePage, props)

  return {
    user,
    ...returned,
  }
}

it('should show the genre name', async () => {
  const relevanceVoteForm = await superValidate(
    { relevanceVote: undefined },
    zod(relevanceVoteSchema),
  )
  const { getByTestId } = setup({
    data: {
      id: 0,
      user: {
        id: 0,
        username: 'username',
        darkMode: false,
        genreRelevanceFilter: 0,
        showRelevanceTags: false,
        showTypeTags: false,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      genre: {
        id: 0,
        name: 'Test',
        subtitle: 'Subtitle',
        type: 'STYLE',
        akas: ['AKA'],
        parents: [],
        children: [],
        influencedBy: [],
        influences: [],
        shortDescription: 'A short description.',
        longDescription: 'A long description.',
        notes: 'Some notes.',
        relevance: 0,
        nsfw: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      leftPaneSize: undefined,
      streamed: {
        genres: Promise.resolve([]),
      },
      relevanceVotes: new Map(),
      relevanceVoteForm,
      contributors: [],
    },
  })

  expect(getByTestId('genre-name')).toHaveTextContent('Test')
})

it('should show the NSFW status of the genre', async () => {
  const relevanceVoteForm = await superValidate(
    { relevanceVote: undefined },
    zod(relevanceVoteSchema),
  )
  const { getByText } = setup({
    data: {
      id: 0,
      user: {
        id: 0,
        username: 'username',
        darkMode: false,
        genreRelevanceFilter: 0,
        showRelevanceTags: false,
        showTypeTags: false,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      genre: {
        id: 0,
        name: 'Test',
        subtitle: 'Subtitle',
        type: 'STYLE',
        akas: ['AKA'],
        parents: [],
        children: [],
        influencedBy: [],
        influences: [],
        shortDescription: 'A short description.',
        longDescription: 'A long description.',
        notes: 'Some notes.',
        relevance: 0,
        nsfw: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      leftPaneSize: undefined,
      streamed: {
        genres: Promise.resolve([]),
      },
      relevanceVotes: new Map(),
      relevanceVoteForm,
      contributors: [],
    },
  })
  expect(getByText('NSFW')).toBeInTheDocument()
})
