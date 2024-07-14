import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { expect, it } from 'vitest'

import { genreSchema } from '$lib/server/db/utils'

import GenreForm from './GenreForm.svelte'

it('displays a warning when saving a genre with no parents (top-level)', async () => {
  const user = userEvent.setup()
  const form = await superValidate({ name: 'hi' }, zod(genreSchema))
  const { getByRole } = render(GenreForm, { data: form, genres: Promise.resolve([]) })
  await user.click(getByRole('button', { name: 'Save' }))
  expect(getByRole('alertdialog')).toHaveTextContent(
    'You are submitting a top level genre. Are you sure you want to continue?',
  )
})
