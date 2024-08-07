import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { expect, it } from 'vitest'

import GenrePageHeader from './GenrePageHeader.svelte'

function setup(props: ComponentProps<GenrePageHeader>) {
  const user = userEvent.setup()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const returned = render(GenrePageHeader, props)

  return {
    user,
    ...returned,
  }
}

it('should show the genre NSFW status', () => {
  const { getByText } = setup({
    id: 0,
    name: 'Action',
    subtitle: null,
    nsfw: true,
  })
  expect(getByText('NSFW')).toBeInTheDocument()
})
