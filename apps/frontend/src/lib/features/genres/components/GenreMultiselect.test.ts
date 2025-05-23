import { QueryClient } from '@tanstack/svelte-query'
import { render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { writable } from 'svelte/store'
import { expect, it, test, vi } from 'vitest'

import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import type { UserSettings } from '$lib/contexts/user-settings/types'
import { DEFAULT_USER_SETTINGS } from '$lib/contexts/user-settings/types'
import { createGenreStore } from '$lib/features/genres/queries/infrastructure'
import type { TreeGenre } from '$lib/features/genres/queries/types'
import { genreQueries } from '$lib/features/genres/tanstack'

import GenreMultiselect from './GenreMultiselect.svelte'

const data: TreeGenre[] = [
  {
    id: 0,
    name: 'Zero',
    subtitle: null,
    akas: [],
    type: 'META',
    nsfw: false,
    children: [],
    derivations: [],
    relevance: 1,
    updatedAt: new Date(),
  },
  {
    id: 1,
    name: 'One',
    subtitle: 'Subtitle',
    akas: [],
    type: 'MOVEMENT',
    nsfw: false,
    children: [],
    derivations: [],
    relevance: 1,
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Two',
    subtitle: 'Subtitle',
    akas: [],
    type: 'SCENE',
    nsfw: false,
    children: [],
    derivations: [],
    relevance: 1,
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: 'Three',
    subtitle: 'Subtitle',
    akas: [],
    type: 'STYLE',
    nsfw: false,
    children: [],
    derivations: [],
    relevance: 1,
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: 'Four',
    subtitle: 'Subtitle',
    akas: ['Five'],
    type: 'TREND',
    nsfw: false,
    children: [],
    derivations: [],
    relevance: 1,
    updatedAt: new Date(),
  },
]

const setup = (
  props: ComponentProps<typeof GenreMultiselect>,
  options: { userSettings?: Partial<UserSettings>; genres?: TreeGenre[] } = {},
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        experimental_prefetchInRender: true,
        enabled: false,
      },
    },
  })

  queryClient.setQueryData(genreQueries.tree().queryKey, createGenreStore(options.genres ?? data))

  const returned = render(GenreMultiselect, {
    props,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: new Map<any, any>([
      [
        USER_SETTINGS_CONTEXT_KEY,
        writable<UserSettings>({ ...DEFAULT_USER_SETTINGS, ...options.userSettings }),
      ],
      ['$$_queryClient', queryClient],
    ]),
  })

  const input = returned.getByRole('textbox')

  const user = userEvent.setup()

  return {
    ...returned,
    input,
    user,
  }
}

test('renders selected genres', () => {
  const { queryAllByTestId } = setup({ value: data.map((g) => g.id) })

  const selected = queryAllByTestId('multiselect__selected')

  expect(selected).toHaveLength(data.length)
  expect(selected[0]).toHaveTextContent(/^Zero Meta$/)
  expect(selected[1]).toHaveTextContent(/^One \[Subtitle\] Mvmt$/)
  expect(selected[2]).toHaveTextContent(/^Two \[Subtitle\] Scene$/)
  expect(selected[3]).toHaveTextContent(/^Three \[Subtitle\]$/)
  expect(selected[4]).toHaveTextContent(/^Four \[Subtitle\] Trend$/)
})

test('renders selected genres with no type chips when showTypeTags is disabled', () => {
  const { queryAllByTestId } = setup(
    { value: data.map((g) => g.id) },
    { userSettings: { showTypeTags: false } },
  )

  const selected = queryAllByTestId('multiselect__selected')

  expect(selected).toHaveLength(data.length)
  expect(selected[0]).toHaveTextContent(/^Zero$/)
  expect(selected[1]).toHaveTextContent(/^One \[Subtitle\]$/)
  expect(selected[2]).toHaveTextContent(/^Two \[Subtitle\]$/)
  expect(selected[3]).toHaveTextContent(/^Three \[Subtitle\]$/)
  expect(selected[4]).toHaveTextContent(/^Four \[Subtitle\]$/)
})

test('renders no selected genres when value is empty', () => {
  const { queryAllByTestId } = setup({ value: [] })
  expect(queryAllByTestId('multiselect__selected')).toHaveLength(0)
})

test('renders all options when input is focused', async () => {
  const { queryAllByTestId, user, input } = setup({
    value: [],
  })

  await user.click(input)

  const options = queryAllByTestId('multiselect__option')
  expect(options).toHaveLength(data.length)
  expect(options[0]).toHaveTextContent(/^Four \[Subtitle\] Trend$/)
  expect(options[1]).toHaveTextContent(/^One \[Subtitle\] Mvmt$/)
  expect(options[2]).toHaveTextContent(/^Three \[Subtitle\]$/)
  expect(options[3]).toHaveTextContent(/^Two \[Subtitle\] Scene$/)
  expect(options[4]).toHaveTextContent(/^Zero Meta$/)
})

test('closes the options when clicking outside', async () => {
  const { queryAllByTestId, user, input } = setup({
    value: [],
  })

  await user.click(input)
  expect(queryAllByTestId('multiselect__option')).toHaveLength(data.length)

  await user.click(document.body)
  await waitFor(() => {
    expect(queryAllByTestId('multiselect__option')).toHaveLength(0)
  })
})

test('selects the top search result when hitting enter', async () => {
  const onChange = vi.fn()
  const { queryAllByTestId, user, input } = setup({
    value: [],
    onChange,
  })

  await user.click(input)
  await user.keyboard('{enter}')

  const selected = queryAllByTestId('multiselect__selected')
  expect(selected).toHaveLength(1)
  expect(selected[0]).toHaveTextContent(/^Four \[Subtitle\] Trend$/)
  expect(onChange).toHaveBeenCalledWith([4])

  expect(queryAllByTestId('multiselect__option')).toHaveLength(data.length - 1)
})

test('selects the next search result when pressing down arrow', async () => {
  const onChange = vi.fn()
  const { queryAllByTestId, user, input } = setup({
    value: [],
    onChange,
  })

  await user.click(input)
  await user.keyboard('{arrowdown}')
  await user.keyboard('{enter}')

  const selected = queryAllByTestId('multiselect__selected')
  expect(selected).toHaveLength(1)
  expect(selected[0]).toHaveTextContent(/^One \[Subtitle\] Mvmt$/)
  expect(onChange).toHaveBeenCalledWith([1])

  expect(queryAllByTestId('multiselect__option')).toHaveLength(data.length - 1)
})

test('wraps around when navigating the search results with arrow keys', async () => {
  const onChange = vi.fn()
  const { queryAllByTestId, user, input } = setup({
    value: [],
    onChange,
  })

  await user.click(input)
  await user.keyboard('{arrowdown}'.repeat(data.length))
  await user.keyboard('{enter}')

  const selected = queryAllByTestId('multiselect__selected')
  expect(selected).toHaveLength(1)
  expect(selected[0]).toHaveTextContent(/^Four \[Subtitle\] Trend$/)
  expect(onChange).toHaveBeenCalledWith([4])

  expect(queryAllByTestId('multiselect__option')).toHaveLength(data.length - 1)
})

test('selects an option when clicked', async () => {
  const onChange = vi.fn()
  const { queryAllByTestId, user, input } = setup({
    value: [],
    onChange,
  })

  await user.click(input)

  await user.click(queryAllByTestId('multiselect__option')[0])

  const selected = queryAllByTestId('multiselect__selected')
  expect(selected).toHaveLength(1)
  expect(selected[0]).toHaveTextContent(/^Four \[Subtitle\] Trend$/)
  expect(onChange).toHaveBeenCalledWith([4])

  expect(queryAllByTestId('multiselect__option')).toHaveLength(data.length - 1)
})

it('focuses the input after clicking an option', async () => {
  const onChange = vi.fn()
  const { queryAllByTestId, user, input } = setup({
    value: [],
    onChange,
  })

  await user.click(input)

  await user.click(queryAllByTestId('multiselect__option')[0])

  expect(input).toHaveFocus()
})

test('displays "Unknown" for selected nonexistent genres', () => {
  const { queryAllByTestId } = setup({
    value: [5],
  })

  const selected = queryAllByTestId('multiselect__selected')
  expect(selected).toHaveLength(1)
  expect(selected[0]).toHaveTextContent('Unknown')
})

test('should match on names', async () => {
  const { queryAllByTestId, user, input } = setup({
    value: [],
  })

  await user.click(input)
  await user.type(input, 'Three')

  await waitFor(() => {
    const options = queryAllByTestId('multiselect__option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent(/^Three \[Subtitle\]$/)
  })
})

test('should match on AKAs', async () => {
  const { queryAllByTestId, user, input } = setup({
    value: [],
  })

  await user.click(input)
  await user.type(input, 'Five')

  await waitFor(() => {
    const options = queryAllByTestId('multiselect__option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent(/^Four \[Subtitle\] \(Five\) Trend$/)
  })
})

it('blurs NSFW options when showNsfw is disabled', async () => {
  const { queryAllByTestId, user, input } = setup(
    { value: [] },
    {
      userSettings: {
        showNsfw: false,
      },
      genres: [
        {
          id: 5,
          name: 'Five',
          subtitle: 'Subtitle',
          akas: [],
          type: 'TREND',
          nsfw: true,
          children: [],
          derivations: [],
          relevance: 1,
          updatedAt: new Date(),
        },
      ],
    },
  )

  await user.click(input)
  const options = queryAllByTestId('multiselect__option')
  await waitFor(() => {
    expect(options[0].children[0]).toHaveClass('blur-sm')
  })
})

it('does not blur NSFW options when showNsfw is enabled', async () => {
  const { queryAllByTestId, user, input } = setup(
    { value: [] },
    {
      userSettings: { showNsfw: true },
      genres: [
        {
          id: 5,
          name: 'Five',
          subtitle: 'Subtitle',
          akas: [],
          type: 'TREND',
          nsfw: true,
          children: [],
          derivations: [],
          relevance: 1,
          updatedAt: new Date(),
        },
      ],
    },
  )

  await user.click(input)
  const options = queryAllByTestId('multiselect__option')
  await waitFor(() => {
    expect(options[0].children[0]).not.toHaveClass('blur-sm')
  })
})

it('does not blur non-NSFW options', async () => {
  const { queryAllByTestId, user, input } = setup(
    { value: [] },
    {
      userSettings: { showNsfw: false },
      genres: [
        {
          id: 5,
          name: 'Five',
          subtitle: 'Subtitle',
          akas: [],
          type: 'TREND',
          nsfw: false,
          children: [],
          derivations: [],
          relevance: 1,
          updatedAt: new Date(),
        },
      ],
    },
  )

  await user.click(input)
  const options = queryAllByTestId('multiselect__option')
  await waitFor(() => {
    expect(options[0].children[0]).not.toHaveClass('blur-sm')
  })
})

it('blurs selected NSFW options when showNsfw is disabled', async () => {
  const { queryAllByTestId, user, input } = setup(
    { value: [5] },
    {
      userSettings: { showNsfw: false },
      genres: [
        {
          id: 5,
          name: 'Five',
          subtitle: 'Subtitle',
          akas: [],
          type: 'TREND',
          nsfw: true,
          children: [],
          derivations: [],
          relevance: 1,
          updatedAt: new Date(),
        },
      ],
    },
  )

  await user.click(input)
  const selected = queryAllByTestId('multiselect__selected__label')
  await waitFor(() => {
    expect(selected[0].children[0]).toHaveClass('blur-sm')
  })
})

it('does not blur selected NSFW options when showNsfw is enabled', async () => {
  const { queryAllByTestId, user, input } = setup(
    { value: [5] },
    {
      userSettings: { showNsfw: true },
      genres: [
        {
          id: 5,
          name: 'Five',
          subtitle: 'Subtitle',
          akas: [],
          type: 'TREND',
          nsfw: true,
          children: [],
          derivations: [],
          relevance: 1,
          updatedAt: new Date(),
        },
      ],
    },
  )

  await user.click(input)
  const selected = queryAllByTestId('multiselect__selected__label')
  await waitFor(() => {
    expect(selected[0].children[0]).not.toHaveClass('blur-sm')
  })
})

it('does not blur selected non-NSFW options', async () => {
  const { queryAllByTestId, user, input } = setup(
    { value: [5] },
    {
      userSettings: { showNsfw: false },
      genres: [
        {
          id: 5,
          name: 'Five',
          subtitle: 'Subtitle',
          akas: [],
          type: 'TREND',
          nsfw: false,
          children: [],
          derivations: [],
          relevance: 1,
          updatedAt: new Date(),
        },
      ],
    },
  )

  await user.click(input)
  const selected = queryAllByTestId('multiselect__selected__label')
  await waitFor(() => {
    expect(selected[0].children[0]).not.toHaveClass('blur-sm')
  })
})
