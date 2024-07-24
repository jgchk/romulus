import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { describe, expect, it } from 'vitest'

import { userSettings } from '$lib/contexts/user-settings'

import GenrePage from './+page.svelte'
import { relevanceVoteSchema } from './utils'

const mockUser = {
  id: 0,
  username: 'username',
  darkMode: false,
  genreRelevanceFilter: 0,
  showRelevanceTags: false,
  showTypeTags: false,
  showNsfw: false,
  permissions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockGenre = {
  id: 0,
  name: 'Test',
  subtitle: 'Subtitle',
  type: 'STYLE' as const,
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
}

async function setup(
  props: Omit<Partial<ComponentProps<GenrePage>>, 'data'> & {
    data?: Partial<ComponentProps<GenrePage>['data']>
  } = {},
) {
  const user = userEvent.setup()

  const relevanceVoteForm = await superValidate(
    { relevanceVote: undefined },
    zod(relevanceVoteSchema),
  )

  const returned = render(GenrePage, {
    ...props,
    data: {
      id: 0,
      user: mockUser,
      genre: mockGenre,
      leftPaneSize: undefined,
      streamed: {
        genres: Promise.resolve([]),
      },
      relevanceVotes: new Map(),
      relevanceVoteForm,
      contributors: [],
      ...props?.data,
    },
  })

  return {
    ...returned,
    user,
  }
}

describe('GenrePage', () => {
  it('should show the genre name', async () => {
    const { getByTestId } = await setup()
    expect(getByTestId('genre-name')).toHaveTextContent('Test')
  })

  it('should show the NSFW status of the genre', async () => {
    const { getByText } = await setup({
      data: {
        genre: { ...mockGenre, nsfw: true },
      },
    })
    expect(getByText('NSFW')).toBeInTheDocument()
  })

  it('should blur the page when the genre is NSFW and showNsfw is false', async () => {
    userSettings.update((prev) => ({ ...prev, showNsfw: false }))
    const { getByTestId } = await setup({
      data: {
        genre: { ...mockGenre, nsfw: true },
      },
    })
    expect(getByTestId('genre-page')).toHaveClass('blur-sm')
  })

  it('should not blur the page when the genre is not NSFW', async () => {
    userSettings.update((prev) => ({ ...prev, showNsfw: false }))
    const { getByTestId } = await setup({
      data: {
        genre: { ...mockGenre, nsfw: false },
      },
    })
    expect(getByTestId('genre-page')).not.toHaveClass('blur-sm')
  })

  it('should not blur the page when showNsfw is true', async () => {
    userSettings.update((prev) => ({ ...prev, showNsfw: true }))
    const { getByTestId } = await setup({
      data: {
        genre: { ...mockGenre, nsfw: true },
      },
    })
    expect(getByTestId('genre-page')).not.toHaveClass('blur-sm')
  })
})
