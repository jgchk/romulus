import { fireEvent, render } from '@testing-library/svelte'
import { expect, it, vi } from 'vitest'

import Popover from './OptionsDropdown.svelte'

const sampleOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
]

it('displays "No results" when there are no options', () => {
  const { getByText } = render(Popover, {
    options: [],
    popoverElement: () => {},
    focusedIndex: 0,
  })
  expect(getByText('No results')).toBeInTheDocument()
})

it('does not display "Load More" when there are no options', () => {
  const { queryByText } = render(Popover, {
    options: [],
    popoverElement: () => {},
    focusedIndex: 0,
    hasMore: true,
  })
  expect(queryByText('Load More...')).not.toBeInTheDocument()
})

it('displays options correctly', () => {
  const { getByText } = render(Popover, {
    options: sampleOptions,
    popoverElement: () => {},
    focusedIndex: 0,
  })
  expect(getByText('Option 1')).toBeInTheDocument()
  expect(getByText('Option 2')).toBeInTheDocument()
  expect(getByText('Option 3')).toBeInTheDocument()
})

it('dispatches select event when an option is clicked', async () => {
  const selectSpy = vi.fn()
  const { getAllByTestId } = render(Popover, {
    options: sampleOptions,
    popoverElement: () => {},
    focusedIndex: 0,
    onSelect: selectSpy,
  })
  const options = getAllByTestId('multiselect__option')
  await fireEvent.click(options[1])
  expect(selectSpy).toHaveBeenCalledTimes(1)
  expect(selectSpy.mock.calls[0][0]).toEqual({
    option: sampleOptions[1],
    i: 1,
  })
})

it('does not display "Load More" when hasMore is false', () => {
  const { queryByText } = render(Popover, {
    options: sampleOptions,
    popoverElement: () => {},
    focusedIndex: 0,
    hasMore: false,
  })
  expect(queryByText('Load More...')).not.toBeInTheDocument()
})

it('dispatches loadMore event when "Load More" is clicked', async () => {
  const loadMoreSpy = vi.fn()
  const { getByText } = render(Popover, {
    options: sampleOptions,
    popoverElement: () => {},
    focusedIndex: 0,
    hasMore: true,
    onLoadMore: loadMoreSpy,
  })
  const loadMoreButton = getByText('Load More...')
  await fireEvent.click(loadMoreButton)
  expect(loadMoreSpy).toHaveBeenCalledTimes(1)
})

it('updates focusedIndex on mouseenter for options', async () => {
  const { getAllByTestId } = render(Popover, {
    options: sampleOptions,
    popoverElement: () => {},
    focusedIndex: 0,
  })
  const options = getAllByTestId('multiselect__option')
  // Initially, focusedIndex is 0, so the first option should be focused
  expect(options[0]).toHaveClass('border-secondary-500')
  expect(options[1]).not.toHaveClass('border-secondary-500')
  // Hover over the second option
  await fireEvent.mouseEnter(options[1])
  expect(options[0]).not.toHaveClass('border-secondary-500')
  expect(options[1]).toHaveClass('border-secondary-500')
})
