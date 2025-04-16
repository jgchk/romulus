import { fireEvent, render, waitFor } from '@testing-library/svelte'
import { expect, it, vi } from 'vitest'

import SelectDropdown from './SelectDropdown.svelte'

type Option = { value: string; label: string }

const sampleOptions: Option[] = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
]

function delayedOptions(options: Option[], delay: number): Promise<Option[]> {
  return new Promise((resolve) => setTimeout(() => resolve(options), delay))
}

function rejectingPromise(errorMessage: string): Promise<Option[]> {
  return Promise.reject(new Error(errorMessage))
}

it('displays "No results" when there are no options', () => {
  const { getByText } = render(SelectDropdown, {
    options: [],
    popoverElement: () => {},
    focusedIndex: 0,
  })
  expect(getByText('No results')).toBeInTheDocument()
})

it('does not display "Load More" when there are no options', () => {
  const { queryByText } = render(SelectDropdown, {
    options: [],
    popoverElement: () => {},
    focusedIndex: 0,
    hasMore: true,
  })
  expect(queryByText('Load More...')).not.toBeInTheDocument()
})

it('displays options correctly', () => {
  const { getByText } = render(SelectDropdown, {
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
  const { getAllByTestId } = render(SelectDropdown, {
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
  const { queryByText } = render(SelectDropdown, {
    options: sampleOptions,
    popoverElement: () => {},
    focusedIndex: 0,
    hasMore: false,
  })
  expect(queryByText('Load More...')).not.toBeInTheDocument()
})

it('dispatches loadMore event when "Load More" is clicked', async () => {
  const loadMoreSpy = vi.fn()
  const { getByText } = render(SelectDropdown, {
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
  const { getAllByTestId } = render(SelectDropdown, {
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

it('displays loading indicator when options is a promise', async () => {
  const promise = delayedOptions(sampleOptions, 100)
  const { getByText, findByText } = render(SelectDropdown, {
    options: promise,
    popoverElement: () => {},
    focusedIndex: 0,
  })

  // Check for loading indicator
  expect(getByText('Loading...')).toBeInTheDocument()

  // Wait for promise to resolve and options to appear
  await findByText('Option 1')
  expect(getByText('Option 1')).toBeInTheDocument()
  expect(() => getByText('Loading...')).toThrow()
})

it('displays options immediately when promise resolves quickly', async () => {
  const promise = Promise.resolve(sampleOptions)
  const { getByText, queryByText } = render(SelectDropdown, {
    options: promise,
    popoverElement: () => {},
    focusedIndex: 0,
  })

  // Since the promise resolves immediately, options should be displayed
  await waitFor(() => expect(getByText('Option 1')).toBeInTheDocument())
  expect(queryByText('Loading...')).not.toBeInTheDocument()
})

it('displays error message when promise rejects', async () => {
  const promise = rejectingPromise('Failed to load options')
  const { getByText, findByText } = render(SelectDropdown, {
    options: promise,
    popoverElement: () => {},
    focusedIndex: 0,
  })

  // Check for loading indicator
  expect(getByText('Loading...')).toBeInTheDocument()

  // Wait for error message
  await findByText('Error: Failed to load options')
  expect(getByText('Error: Failed to load options')).toBeInTheDocument()
  expect(() => getByText('Loading...')).toThrow()
})

it('handles change from array to promise', async () => {
  const { getByText, findByText, rerender } = render(SelectDropdown, {
    options: sampleOptions,
    popoverElement: () => {},
    focusedIndex: 0,
  })

  expect(getByText('Option 1')).toBeInTheDocument()

  const newOptions = [{ value: '4', label: 'Option 4' }]
  const promise = delayedOptions(newOptions, 100)
  await rerender({ options: promise })

  await waitFor(() => expect(getByText('Loading...')).toBeInTheDocument())

  await findByText('Option 4')
  expect(getByText('Option 4')).toBeInTheDocument()
  expect(() => getByText('Loading...')).toThrow()
})

it('handles change from promise to array', async () => {
  const promise = delayedOptions(sampleOptions, 100)
  const { getByText, findByText, rerender } = render(SelectDropdown, {
    options: promise,
    popoverElement: () => {},
    focusedIndex: 0,
  })

  expect(getByText('Loading...')).toBeInTheDocument()

  await findByText('Option 1')
  expect(getByText('Option 1')).toBeInTheDocument()

  const newOptions = [{ value: '4', label: 'Option 4' }]
  await rerender({ options: newOptions })

  await waitFor(() => expect(getByText('Option 4')).toBeInTheDocument())
  expect(() => getByText('Loading...')).toThrow()
})

it('applies focusedIndex after promise resolves', async () => {
  const promise = delayedOptions(sampleOptions, 100)
  const { getAllByTestId, findByText } = render(SelectDropdown, {
    options: promise,
    popoverElement: () => {},
    focusedIndex: 1,
  })

  // Wait for options to appear
  await findByText('Option 1')
  const options = getAllByTestId('multiselect__option')
  expect(options[1]).toHaveClass('border-secondary-500')
})

it('displays "Load More" after promise resolves when hasMore is true', async () => {
  const promise = delayedOptions(sampleOptions, 100)
  const { getByText, findByText } = render(SelectDropdown, {
    options: promise,
    popoverElement: () => {},
    focusedIndex: 0,
    hasMore: true,
  })

  // Wait for options to appear
  await findByText('Option 1')
  expect(getByText('Load More...')).toBeInTheDocument()
})
