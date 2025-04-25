import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { setError, superValidate, type SuperValidated } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { expect, it } from 'vitest'
import { type z } from 'zod'

import { DEFAULT_USER_SETTINGS } from '$lib/contexts/user-settings/types'

import SignInPage from './+page.svelte'
import { signInSchema } from './common'

async function setup({ form }: { form?: SuperValidated<z.infer<typeof signInSchema>> } = {}) {
  const returned = render(SignInPage, {
    props: {
      data: {
        user: undefined,
        settings: DEFAULT_USER_SETTINGS,
        form: form ?? (await superValidate({ username: '', password: '' }, zod(signInSchema))),
      },
    },
  })

  const getUsernameInput = () => returned.getByLabelText('Username')
  const getPasswordInput = () => returned.getByLabelText('Password', { exact: true })
  const getSubmitButton = () => returned.getByRole('button', { name: 'Sign in' })
  const getFormError = () => returned.getByRole('alert')

  return {
    ...returned,
    getUsernameInput,
    getPasswordInput,
    getSubmitButton,
    getFormError,
  }
}

it('should tab between username, password, and submit fields', async () => {
  const user = userEvent.setup()

  const { getUsernameInput, getPasswordInput, getSubmitButton } = await setup()

  expect(getUsernameInput()).toHaveFocus()
  await user.tab()
  expect(getPasswordInput()).toHaveFocus()
  await user.tab()
  expect(getSubmitButton()).toHaveFocus()
})

it('should mask password input', async () => {
  const { getPasswordInput } = await setup()

  expect(getPasswordInput()).toHaveAttribute('type', 'password')
})

it('should require all inputs', async () => {
  const { getUsernameInput, getPasswordInput } = await setup()

  expect(getUsernameInput()).toHaveAttribute('required')
  expect(getPasswordInput()).toHaveAttribute('required')
})

it('should show an error if a non-string value is passed', async () => {
  const form = await superValidate(
    // @ts-expect-error - Testing non-string value
    { username: 1, password: '' },
    zod(signInSchema),
  )

  const { getFormError } = await setup({ form })

  expect(getFormError()).toHaveTextContent('Expected string, received number')
})

it('should show an error if there is a manually-set form error', async () => {
  const form = await superValidate({ username: '', password: '' }, zod(signInSchema))
  setError(form, 'Incorrect username or password')

  const { getFormError } = await setup({ form })

  expect(getFormError()).toHaveTextContent('Incorrect username or password')
})
