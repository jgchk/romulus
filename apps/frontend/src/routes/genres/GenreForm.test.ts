import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { expect, it } from 'vitest'

import { genreSchema } from '$lib/server/api/genres/types'

import GenreForm from './GenreForm.svelte'

function setup(props: ComponentProps<typeof GenreForm>) {
  const user = userEvent.setup()

  const returned = render(GenreForm, {
    props,
  })

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

it('should provide a checkbox to indicate that a genre is NSFW', async () => {
  const form = await superValidate({ name: 'hi' }, zod(genreSchema))
  const { user, getByRole } = setup({ data: form, genres: Promise.resolve([]) })
  expect(getByRole('checkbox', { name: 'NSFW' })).not.toBeChecked()
  await user.click(getByRole('checkbox', { name: 'NSFW' }))
  expect(getByRole('checkbox', { name: 'NSFW' })).toBeChecked()
})

it('should precheck the NSFW checkbox if the genre is NSFW', async () => {
  const form = await superValidate({ name: 'hi', nsfw: true }, zod(genreSchema))
  const { getByRole } = setup({ data: form, genres: Promise.resolve([]) })
  expect(getByRole('checkbox', { name: 'NSFW' })).toBeChecked()
})

it('should show errors if the NSFW field is not a boolean', async () => {
  // @ts-expect-error - testing invalid types
  const form = await superValidate({ name: 'hi', nsfw: 'yes' }, zod(genreSchema))
  const { getByRole } = setup({ data: form, genres: Promise.resolve([]) })
  expect(getByRole('alert')).toHaveTextContent('Expected boolean, received string')
})
