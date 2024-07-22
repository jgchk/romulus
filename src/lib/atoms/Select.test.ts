import { render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { SelectProps } from './Select'
import Select from './Select.svelte'

function setup<T>(props: SelectProps<T> = {}) {
  const user = userEvent.setup()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const returned = render(Select, props)

  const getRoot = () => returned.getByTestId('select-root')
  const getButton = () => returned.getByRole('button')
  const getListbox = () => returned.getByRole('listbox')
  const queryListbox = () => returned.queryByRole('listbox')
  const getOption = (name: string) => returned.getByRole('option', { name })

  const onChange = vi.fn()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  returned.component.$on('change', (e) => onChange(e.detail))

  return {
    user,
    getRoot,
    getButton,
    getListbox,
    queryListbox,
    getOption,
    onChange,
    ...returned,
  }
}

describe('Rendering', () => {
  it('should render without errors', () => {
    setup()
  })

  it('should display the selected option when there is a value', () => {
    const { getButton } = setup({
      value: 'b',
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
      ],
    })
    expect(getButton()).toHaveTextContent('bee')
  })

  it('should display a default placeholder when there is no value', () => {
    const { getButton } = setup()
    expect(getButton()).toHaveTextContent('Select...')
  })

  it('should display a custom placeholder when passed in', () => {
    const { getButton } = setup({ placeholder: 'Custom placeholder' })
    expect(getButton()).toHaveTextContent('Custom placeholder')
  })

  it('should display "Unknown value" when the value is not found in the options', () => {
    const { getButton } = setup({
      value: 'c',
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
      ],
    })
    expect(getButton()).toHaveTextContent('Unknown value')
  })

  it('should render an "id" when passed in', () => {
    const { getButton } = setup({ id: 'my-select' })
    expect(getButton()).toHaveAttribute('id', 'my-select')
  })

  it('should render a "class" when passed in', () => {
    const { getRoot } = setup({ class: 'my-class' })
    expect(getRoot()).toHaveClass('my-class')
  })
})

describe('Interaction', () => {
  it('should allow selecting an option', async () => {
    const { user, getButton, getListbox, onChange } = setup({
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
      ],
    })

    await user.click(getButton())
    await user.selectOptions(getListbox(), 'b')

    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith({ value: 'b', label: 'bee' })
  })

  it('should render the selected option with aria-selected', async () => {
    const { user, getButton, getOption } = setup({
      value: 'b',
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
      ],
    })

    await user.click(getButton())

    expect(getOption('a')).toHaveAttribute('aria-selected', 'false')
    expect(getOption('b')).toHaveAttribute('aria-selected', 'true')
  })

  it('should not render the options list until the button is clicked', async () => {
    const { user, queryListbox, getButton } = setup({
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
      ],
    })
    expect(queryListbox()).toBeNull()
    await user.click(getButton())
    expect(queryListbox()).not.toBeNull()
  })

  it('should close the options list when clicking outside', async () => {
    const { user, getButton, queryListbox } = setup({
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
      ],
    })
    await user.click(getButton())
    await waitFor(() => expect(queryListbox()).not.toBeNull())
    await user.click(document.body)
    await waitFor(() => expect(queryListbox()).toBeNull())
  })

  it('should close the options list upon option selection', async () => {
    const { user, getButton, getListbox, queryListbox } = setup({
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
      ],
    })
    await user.click(getButton())
    await waitFor(() => expect(queryListbox()).not.toBeNull())
    await user.selectOptions(getListbox(), 'b')
    await waitFor(() => expect(queryListbox()).toBeNull())
  })
})

describe('Keyboard Navigation', () => {
  it('should not open the options list upon tabbing in to the button', async () => {
    const { user, queryListbox } = setup({
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
      ],
    })
    expect(queryListbox()).toBeNull()
    await user.tab()
    expect(queryListbox()).toBeNull()
  })

  it('should close the options list upon tabbing out of the button', async () => {
    const { user, getButton, queryListbox } = setup({
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
      ],
    })
    await user.click(getButton())
    await waitFor(() => expect(queryListbox()).not.toBeNull())
    await user.tab()
    await waitFor(() => expect(queryListbox()).toBeNull())
  })

  it('should select an option with arrow keys and enter', async () => {
    const { user, getButton, onChange } = setup({
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
        { value: 'c', label: 'see' },
      ],
    })
    await user.click(getButton())
    await user.keyboard('[ArrowDown]')
    await user.keyboard('[ArrowDown]')
    await user.keyboard('[ArrowUp]')
    await user.keyboard('[Enter]')
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith({ value: 'b', label: 'bee' })
  })

  it('should select an option when hovering an option and hitting enter', async () => {
    const { user, getButton, getOption, onChange } = setup({
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
        { value: 'c', label: 'see' },
      ],
    })
    await user.click(getButton())
    await user.hover(getOption('b'))
    await user.keyboard('[Enter]')
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith({ value: 'b', label: 'bee' })
  })

  it('should wrap around when navigating with arrow keys', async () => {
    const { user, getButton, onChange } = setup({
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
        { value: 'c', label: 'see' },
      ],
    })
    await user.click(getButton())
    await user.keyboard('[ArrowUp]')
    await user.keyboard('[Enter]')
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith({ value: 'c', label: 'see' })
  })

  it.each([['ArrowDown'], ['ArrowUp'], ['Enter'], ['Space']])(
    "should open the options list when pressing %s if it isn't open",
    async (key) => {
      const { user, queryListbox } = setup({
        options: [
          { value: 'a', label: 'ayy' },
          { value: 'b', label: 'bee' },
          { value: 'c', label: 'see' },
        ],
      })
      await user.tab()
      await user.keyboard(`[${key}]`)
      await waitFor(() => expect(queryListbox()).not.toBeNull())
    },
  )

  it.each([['ArrowDown'], ['ArrowUp']])(
    'should not change the option when pressing %s if the options list is not open',
    async (key) => {
      const { user, onChange } = setup({
        value: 'a',
        options: [
          { value: 'a', label: 'ayy' },
          { value: 'b', label: 'bee' },
          { value: 'c', label: 'see' },
        ],
      })
      await user.tab()
      await user.keyboard(`[${key}]`)
      await user.keyboard('[Enter]')
      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange).toHaveBeenCalledWith({ value: 'a', label: 'ayy' })
    },
  )

  it('should automatically select the dropdown option matching the current value', async () => {
    const { user, getButton, onChange } = setup({
      value: 'b',
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
        { value: 'c', label: 'see' },
      ],
    })
    await user.click(getButton())
    await user.keyboard('[ArrowDown]')
    await user.keyboard('[Enter]')
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith({ value: 'c', label: 'see' })
  })

  it('should allow selecting options with Space', async () => {
    const { user, getButton, onChange } = setup({
      options: [
        { value: 'a', label: 'ayy' },
        { value: 'b', label: 'bee' },
        { value: 'c', label: 'see' },
      ],
    })
    await user.click(getButton())
    await user.keyboard('[ArrowDown]')
    await user.keyboard('[Space]')
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith({ value: 'b', label: 'bee' })
  })
})

describe('Edge Cases', () => {
  it('should support number values', async () => {
    const { getButton, user, getListbox, onChange } = setup({
      value: 1,
      options: [
        { value: 0, label: 'ayy' },
        { value: 1, label: 'bee' },
      ],
    })
    expect(getButton()).toHaveTextContent('bee')

    await user.click(getButton())
    await user.selectOptions(getListbox(), '0')

    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith({ value: 0, label: 'ayy' })
  })
})
