import { render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { expect } from 'vitest'

import { test } from '../../../../vitest-setup'
import AccountAppsPage from './+page.svelte'

function setup(props: ComponentProps<AccountAppsPage>) {
  const user = userEvent.setup()

  const returned = render(AccountAppsPage, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    props,
  })

  return {
    user,
    ...returned,
  }
}

test('should show an empty state when there are no keys', () => {
  const { getByText, getByRole } = setup({ data: { user: undefined, keys: [] } })
  expect(getByText('No keys found')).toBeInTheDocument()
  expect(getByRole('button', { name: 'Add a key' })).toBeInTheDocument()
})

test('should show existing keys in table', () => {
  const date1 = new Date('2021-01-01')
  const date2 = new Date('2021-01-02')

  const returned = setup({
    data: {
      user: undefined,
      keys: [
        { name: 'key-one', createdAt: date1 },
        { name: 'key-two', createdAt: date2 },
      ],
    },
  })

  expect(returned.getByText('key-one')).toBeInTheDocument()
  expect(returned.getByText('key-two')).toBeInTheDocument()

  expect(returned.getByText('Dec 31, 2020, 7:00:00 PM')).toBeInTheDocument()
  expect(returned.getByText('Jan 1, 2021, 7:00:00 PM')).toBeInTheDocument()
})

test('should show a dialog when add key is clicked', async () => {
  const { getByRole, user } = setup({ data: { user: undefined, keys: [] } })
  await user.click(getByRole('button', { name: 'Add a key' }))
  expect(getByRole('dialog')).toBeInTheDocument()
})

test('should close the dialog when cancel is clicked', async () => {
  const { getByRole, queryByRole, user } = setup({ data: { user: undefined, keys: [] } })
  await user.click(getByRole('button', { name: 'Add a key' }))
  expect(getByRole('dialog')).toBeInTheDocument()
  await user.click(getByRole('button', { name: 'Cancel' }))
  await waitFor(() => expect(queryByRole('dialog')).toBeNull())
})
