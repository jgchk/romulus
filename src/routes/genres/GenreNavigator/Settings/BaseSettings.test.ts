import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { expect, it, vi } from 'vitest'

import BaseSettings from './BaseSettings.svelte'

function setup(props: Partial<ComponentProps<BaseSettings>> = {}) {
  const user = userEvent.setup()

  const returned = render(BaseSettings, {
    genreRelevanceFilter: 0,
    showRelevanceTags: false,
    showTypeTags: false,
    showNsfw: false,
    ...props,
  })

  return {
    user,
    ...returned,
  }
}

it('should include a control to set the relevance filter', () => {
  const { getByLabelText } = setup()
  expect(getByLabelText('Relevance Filter')).toBeInTheDocument()
})

it('should call onChange when the relevance filter is changed', async () => {
  const onChange = vi.fn()
  const { user, getByLabelText, getByRole } = setup({ genreRelevanceFilter: 0, onChange })

  await user.click(getByLabelText('Relevance Filter'))
  await user.selectOptions(getByRole('listbox'), '1')

  expect(onChange).toHaveBeenCalledOnce()
  expect(onChange).toHaveBeenCalledWith({ genreRelevanceFilter: 1 })
})

it('should include a control to toggle relevance tags', () => {
  const { getByLabelText } = setup()
  expect(getByLabelText('Show Relevance Tags')).toBeInTheDocument()
})

it('should call onChange when the relevance tags toggle is clicked', async () => {
  const onChange = vi.fn()
  const { user, getByLabelText } = setup({ showRelevanceTags: true, onChange })

  await user.click(getByLabelText('Show Relevance Tags'))

  expect(onChange).toHaveBeenCalledOnce()
  expect(onChange).toHaveBeenCalledWith({ showRelevanceTags: false })
})

it('should include a control to toggle type tags', () => {
  const { getByLabelText } = setup()
  expect(getByLabelText('Show Type Tags')).toBeInTheDocument()
})

it('should call onChange when the type tags toggle is clicked', async () => {
  const onChange = vi.fn()
  const { user, getByLabelText } = setup({ showTypeTags: true, onChange })

  await user.click(getByLabelText('Show Type Tags'))

  expect(onChange).toHaveBeenCalledOnce()
  expect(onChange).toHaveBeenCalledWith({ showTypeTags: false })
})

it('should include a control to toggle the visiblity of NSFW genres', () => {
  const { getByLabelText } = setup()
  expect(getByLabelText('Show NSFW Genres')).toBeInTheDocument()
})

it('should call onChange when the NSFW genres toggle is clicked', async () => {
  const onChange = vi.fn()
  const { user, getByLabelText } = setup({ showNsfw: true, onChange })

  await user.click(getByLabelText('Show NSFW Genres'))

  expect(onChange).toHaveBeenCalledOnce()
  expect(onChange).toHaveBeenCalledWith({ showNsfw: false })
})
