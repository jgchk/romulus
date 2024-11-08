import { render, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { expect, vi } from 'vitest'

import { toPrettyDate } from '$lib/utils/datetime'

import { test } from '../../../../vitest-setup'
import AccountAppsPage from './+page.svelte'

function setup(props: Partial<ComponentProps<typeof AccountAppsPage>>) {
  const user = userEvent.setup()

  const returned = render(AccountAppsPage, {
    props: {
      disableFormSubmission: true,
      form: null,
      data: { user: undefined, keys: [] },
      ...props,
    },
  })

  const getCreateButton = () => returned.getByRole('button', { name: 'Create an API key' })
  const getCreateDialog = () => returned.getByRole('dialog')
  const queryCreateDialog = () => returned.queryByRole('dialog')
  const getNameInput = () => returned.getByLabelText('Name')
  const getFormError = () => returned.getByRole('alert')
  const getCreateCancelButton = () => returned.getByRole('button', { name: 'Cancel' })
  const getCreateConfirmButton = () => returned.getByRole('button', { name: 'Create' })
  const getDeleteButton = () => returned.getByRole('button', { name: 'Delete' })
  const getDeleteDialog = () => returned.getByRole('alertdialog')
  const queryDeleteDialog = () => returned.queryByRole('alertdialog')
  const getDeleteCancelButton = () => returned.getByRole('button', { name: 'Cancel' })
  const getDeleteConfirmButton = () =>
    within(getDeleteDialog()).getByRole('button', { name: 'Delete' })
  const getCopyButton = () => returned.getByRole('button', { name: 'Copy' })

  return {
    user,
    getCreateButton,
    getCreateDialog,
    queryCreateDialog,
    getNameInput,
    getFormError,
    getCreateCancelButton,
    getCreateConfirmButton,
    getDeleteButton,
    getDeleteDialog,
    queryDeleteDialog,
    getDeleteCancelButton,
    getDeleteConfirmButton,
    getCopyButton,
    ...returned,
  }
}

test('should show an empty state when there are no keys', () => {
  const { getByText, getCreateButton } = setup({ data: { user: undefined, keys: [] } })
  expect(getByText('No API keys found.')).toBeInTheDocument()
  expect(getCreateButton()).toBeInTheDocument()
})

test('should show a create button when there are keys', () => {
  const { getCreateButton } = setup({
    data: { user: undefined, keys: [{ id: 0, name: 'key-one', createdAt: new Date() }] },
  })
  expect(getCreateButton()).toBeInTheDocument()
})

test('should show existing keys in table', () => {
  const date1 = new Date('2024-08-05T20:51:43.048Z')
  const date2 = new Date('2024-08-06T20:51:43.048Z')

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

  expect(returned.getByText(new RegExp(toPrettyDate(date1)))).toBeInTheDocument()
  expect(returned.getByText(new RegExp(toPrettyDate(date2)))).toBeInTheDocument()
})

test('should show a dialog when create key is clicked', async () => {
  const { getCreateButton, getCreateDialog, user } = setup({
    data: { user: undefined, keys: [] },
  })
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
})

test.skip('should close the create dialog when cancel is clicked', async () => {
  const { getCreateButton, getCreateDialog, queryCreateDialog, getCreateCancelButton, user } =
    setup({
      data: { user: undefined, keys: [] },
    })
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
  await user.click(getCreateCancelButton())
  await waitFor(() => expect(queryCreateDialog()).toBeNull())
})

test.skip('should close the create dialog when ESC is pressed', async () => {
  const { getCreateButton, getCreateDialog, queryCreateDialog, user } = setup({
    data: { user: undefined, keys: [] },
  })
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
  await user.keyboard('[Escape]')
  await waitFor(() => expect(queryCreateDialog()).toBeNull())
})

test('should create the new key when create is clicked', async () => {
  const onCreate = vi.fn()
  const { getCreateButton, getCreateDialog, getCreateConfirmButton, getNameInput, user } = setup({
    data: { user: undefined, keys: [] },
    onCreate,
  })
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
  await user.type(getNameInput(), 'key-name')
  await user.click(getCreateConfirmButton())
  expect(onCreate).toHaveBeenCalledWith('key-name')
})

test('should show name form errors', async () => {
  const { getCreateButton, getCreateDialog, getCreateConfirmButton, getFormError, user } = setup({
    form: { action: 'create', errors: { name: ['Name is required'] } },
  })
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
  await user.click(getCreateConfirmButton())
  expect(getFormError()).toHaveTextContent('Name is required')
})

test('name field should be required', async () => {
  const { getCreateButton, getCreateDialog, getNameInput, user } = setup({})
  await user.click(getCreateButton())
  expect(getCreateDialog()).toBeInTheDocument()
  expect(getNameInput()).toHaveAttribute('required')
})

test.skip('should autofocus name field', async () => {
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
  const { getByText, getCopyButton, user } = setup({
    form: { success: true, id: 0, name: 'A Test Key', key: 'a-test-key' },
  })
  expect(getByText('a-test-key')).toBeVisible()
  await user.click(getCopyButton())
  const copiedText = await window.navigator.clipboard.readText()
  expect(copiedText).toEqual('a-test-key')
})

test('should show a confirmation dialog when delete is clicked', async () => {
  const { getDeleteButton, getDeleteDialog, user } = setup({
    data: {
      user: undefined,
      keys: [{ id: 0, name: 'key-one', createdAt: new Date() }],
    },
  })

  await user.click(getDeleteButton())
  expect(getDeleteDialog()).toBeInTheDocument()
})

test.skip('should close the delete dialog when cancel is clicked', async () => {
  const { getDeleteButton, getDeleteCancelButton, getDeleteDialog, queryDeleteDialog, user } =
    setup({
      data: {
        user: undefined,
        keys: [{ id: 0, name: 'key-one', createdAt: new Date() }],
      },
    })
  await user.click(getDeleteButton())
  expect(getDeleteDialog()).toBeInTheDocument()
  await user.click(getDeleteCancelButton())
  await waitFor(() => expect(queryDeleteDialog()).toBeNull())
})

test('should delete the key when the user confirms the delete dialog', async () => {
  const onDelete = vi.fn()
  const { getDeleteButton, getDeleteConfirmButton, getDeleteDialog, user } = setup({
    data: {
      user: undefined,
      keys: [{ id: 0, name: 'key-one', createdAt: new Date() }],
    },
    onDelete,
  })
  await user.click(getDeleteButton())
  expect(getDeleteDialog()).toBeInTheDocument()
  await user.click(getDeleteConfirmButton())
  expect(onDelete).toHaveBeenCalledWith(0)
})

test.skip('should close the delete dialog when ESC is pressed', async () => {
  const { getDeleteButton, getDeleteDialog, queryDeleteDialog, user } = setup({
    data: {
      user: undefined,
      keys: [{ id: 0, name: 'key-one', createdAt: new Date() }],
    },
  })
  await user.click(getDeleteButton())
  expect(getDeleteDialog()).toBeInTheDocument()
  await user.keyboard('[Escape]')
  await waitFor(() => expect(queryDeleteDialog()).toBeNull())
})
