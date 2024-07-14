import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { expect, it } from 'vitest'

import { genreSchema } from '$lib/server/db/utils'

import GenreForm from './GenreForm.svelte'

function setup(props: ComponentProps<GenreForm>) {
  const user = userEvent.setup()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const returned = render(GenreForm, props)

  return {
    user,
    ...returned,
  }
}

it('displays a warning when saving a genre with no parents (top-level)', async () => {
  const form = await superValidate({ name: 'hi' }, zod(genreSchema))
  const { user, getByRole } = setup({ data: form, genres: Promise.resolve([]) })
  await user.click(getByRole('button', { name: 'Save' }))
  expect(getByRole('alertdialog')).toHaveTextContent(
    'You are submitting a top level genre. Are you sure you want to continue?',
  )
})

it('should require a name', async () => {
  const form = await superValidate({}, zod(genreSchema))
  const { user, getByRole } = setup({ data: form, genres: Promise.resolve([]) })
  await user.click(getByRole('button', { name: 'Save' }))
  expect(getByRole('alert')).toHaveTextContent('Name is required')
})
