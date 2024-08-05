import { render } from '@testing-library/svelte'
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
