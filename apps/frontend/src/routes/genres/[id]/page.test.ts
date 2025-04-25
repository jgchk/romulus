import { QueryClient } from '@tanstack/svelte-query'
import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { type ComponentProps } from 'svelte'
import { writable } from 'svelte/store'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { describe, expect, it } from 'vitest'

import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'
import { relevanceVoteSchema } from '$lib/features/genres/components/RelevanceVoteForm'
import { createGenreStore } from '$lib/features/genres/queries/infrastructure'
import { genreQueries } from '$lib/features/genres/tanstack'

import GenrePage from './+page.svelte'

const mockUser = {
  id: 0,
  username: 'username',
  darkMode: false,
  genreRelevanceFilter: 0,
  showRelevanceTags: false,
  showTypeTags: false,
  showNsfw: false,
  permissions: {
    genres: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canVoteRelevance: true,
    },
    mediaTypes: {
      canCreate: false,
    },
    mediaArtifactTypes: {
      canCreate: false,
    },
  },
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
  derivedFrom: [],
  derivations: [],
  influencedBy: [],
  influences: [],
  shortDescription: 'A short description.',
  longDescription: 'A long description.',
  notes: 'Some notes.',
  relevance: 0,
  nsfw: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  contributors: [],
}

async function setup(
  props: Omit<Partial<ComponentProps<typeof GenrePage>>, 'data'> & {
    data?: Partial<ComponentProps<typeof GenrePage>['data']>
  } = {},
  options: { userSettings?: Partial<UserSettings> } = {},
) {
  const user = userEvent.setup()

  const relevanceVoteForm = await superValidate(
    { relevanceVote: undefined },
    zod(relevanceVoteSchema),
  )

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        experimental_prefetchInRender: true,
        enabled: false,
      },
    },
  })
  queryClient.setQueryData(genreQueries.tree().queryKey, createGenreStore([]))

  const returned = render(GenrePage, {
    props: {
      ...props,
      data: {
        id: 0,
        user: mockUser,
        settings: DEFAULT_USER_SETTINGS,
        genre: mockGenre,
        leftPaneSize: undefined,
        relevanceVotes: new Map(),
        relevanceVoteForm,
        ...props?.data,
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: new Map<any, any>([
      [
        USER_SETTINGS_CONTEXT_KEY,
        writable<UserSettings>({ ...DEFAULT_USER_SETTINGS, ...options.userSettings }),
      ],
      ['$$_queryClient', queryClient],
    ]),
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
    const { getByTestId, getByText } = await setup(
      {
        data: {
          genre: { ...mockGenre, nsfw: true },
        },
      },
      { userSettings: { showNsfw: false } },
    )
    expect(getByTestId('genre-page')).toHaveClass('blur')
    expect(getByText('Enable NSFW genres in settings to view this genre')).toBeInTheDocument()
  })

  it('should not blur the page when the genre is not NSFW', async () => {
    const { getByTestId, queryByText } = await setup(
      {
        data: {
          genre: { ...mockGenre, nsfw: false },
        },
      },
      { userSettings: { showNsfw: false } },
    )
    expect(getByTestId('genre-page')).not.toHaveClass('blur')
    expect(queryByText('Enable NSFW genres in settings to view this genre')).toBeNull()
  })

  it('should not blur the page when showNsfw is true', async () => {
    const { getByTestId, queryByText } = await setup(
      {
        data: {
          genre: { ...mockGenre, nsfw: true },
        },
      },
      { userSettings: { showNsfw: true } },
    )
    expect(getByTestId('genre-page')).not.toHaveClass('blur')
    expect(queryByText('Enable NSFW genres in settings to view this genre')).toBeNull()
  })
})
