import { render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { expect, vi } from 'vitest'

import { test } from '../../../../vitest-setup'
import AccountAppsPage from './+page.svelte'

function setup(props: Partial<ComponentProps<AccountAppsPage>>) {
  const user = userEvent.setup()

  const returned = render(AccountAppsPage, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    props: {
      disableFormSubmission: true,
      form: null,
      data: { user: undefined, keys: [] },
      ...props,
    },
  })

  const getCreateButton = () => returned.getByRole('button', { name: 'Create a key' })
  const getCreateDialog = () => returned.getByRole('dialog')
  const queryCreateDialog = () => returned.queryByRole('dialog')
  const getNameInput = () => returned.getByLabelText('Name')

  const onSubmit = vi.fn()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  returned.component.$on('submit', (e) => onSubmit(e.detail))

  return {
    user,
    getCreateButton,
    getCreateDialog,
    queryCreateDialog,
    getNameInput,
    onSubmit,
    ...returned,
  }
}

test('should show an empty state when there are no keys', () => {
  const { getByText, getCreateButton } = setup({ data: { user: undefined, keys: [] } })
  expect(getByText('No keys found')).toBeInTheDocument()
  expect(getCreateButton()).toBeInTheDocument()
})

test('should show a create button when there are keys', () => {
  const { getCreateButton } = setup({
    data: { user: undefined, keys: [{ id: 0, name: 'key-one', createdAt: new Date() }] },
  })
  expect(getCreateButton()).toBeInTheDocument()
})

test('should show existing keys in table', () => {
  const date1 = new Date('2021-01-01')
  const date2 = new Date('2021-01-02')

  const returned = setup({
    data: {
      user: undefined,
      keys: [
        { id: 0, name: 'key-one', createdAt: date1 },
        { id: 1, name: 'key-two', createdAt: date2 },
      ],
    },
  })

  expect(returned.getByText('key-one')).toBeInTheDocument()
  expect(returned.getByText('key-two')).toBeInTheDocument()

  expect(returned.getByText('Dec 31, 2020, 7:00:00 PM')).toBeInTheDocument()
  expect(returned.getByText('Jan 1, 2021, 7:00:00 PM')).toBeInTheDocument()
})

test('should show a dialog when create key is clicked', async () => {
  const { getCreateButton, getCreateDialog, user } = setup({
    data: { user: undefined, keys: [] },
  })
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
})

test('should close the dialog when cancel is clicked', async () => {
  const { getCreateButton, getCreateDialog, queryCreateDialog, getByRole, user } = setup({
    data: { user: undefined, keys: [] },
  })
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
  await user.click(getByRole('button', { name: 'Cancel' }))
  await waitFor(() => expect(queryCreateDialog()).toBeNull())
})

test('should submit the new key when create is clicked', async () => {
  const { getCreateButton, getCreateDialog, getByRole, getNameInput, user, onSubmit } = setup({
    data: { user: undefined, keys: [] },
  })
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
  await user.type(getNameInput(), 'key-name')
  await user.click(getByRole('button', { name: 'Create' }))
  expect(onSubmit).toHaveBeenCalledWith({ name: 'key-name' })
})

test('should show name form errors', async () => {
  const { getCreateButton, getCreateDialog, getByRole, user } = setup({
    form: { errors: { name: ['Name is required'] } },
  })
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
  await user.click(getByRole('button', { name: 'Create' }))
  expect(getByRole('alert')).toHaveTextContent('Name is required')
})

test('name field should be required', async () => {
  const { getCreateButton, getCreateDialog, getNameInput, user } = setup({})
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
  expect(getNameInput()).toHaveAttribute('required')
})

test('should autofocus name field', async () => {
  const { getCreateButton, getCreateDialog, getNameInput, user } = setup({})
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
  await waitFor(() => expect(getNameInput()).toHaveFocus())
})

test('should display generated key after creation', () => {
  const { getByText } = setup({
    form: { success: true, id: 0, name: 'A Test Key', key: 'a-test-key' },
  })
  expect(getByText('a-test-key')).toBeVisible()
})

test('should allow user to copy key', async () => {
  const { getByText, getByRole, user } = setup({
    form: { success: true, id: 0, name: 'A Test Key', key: 'a-test-key' },
  })
  expect(getByText('a-test-key')).toBeVisible()
  await user.click(getByRole('button', { name: 'Copy' }))
  const copiedText = await window.navigator.clipboard.readText()
  expect(copiedText).toEqual('a-test-key')
})
