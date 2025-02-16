import { render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { setError, superValidate, type SuperValidated } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { expect, it } from 'vitest'
import type { z } from 'zod'

import { DEFAULT_USER_SETTINGS } from '$lib/contexts/user-settings/types'

import SignUpPage from './+page.svelte'
import { signUpSchema } from './common'

async function setup({ form }: { form?: SuperValidated<z.infer<typeof signUpSchema>> } = {}) {
  const returned = render(SignUpPage, {
    props: {
      data: {
        user: undefined,
        settings: DEFAULT_USER_SETTINGS,
        form:
          form ??
          (await superValidate(
            { username: '', password: { password: '', confirmPassword: '' } },
            zod(signUpSchema),
          )),
      },
    },
  })

  const getUsernameInput = () => returned.getByLabelText('Username')
  const getPasswordInput = () => returned.getByLabelText('Password', { exact: true })
  const getConfirmPasswordInput = () => returned.getByLabelText('Confirm password')
  const getSubmitButton = () => returned.getByRole('button', { name: 'Sign up' })
  const getFormError = () => returned.getByRole('alert')

  return {
    ...returned,
    getUsernameInput,
    getPasswordInput,
    getConfirmPasswordInput,
    getSubmitButton,
    getFormError,
  }
}

it('should tab between username, password, confirm password, and submit fields', async () => {
  const user = userEvent.setup()

  const { getUsernameInput, getPasswordInput, getConfirmPasswordInput, getSubmitButton } =
    await setup()

  expect(getUsernameInput()).toHaveFocus()
  await user.tab()
  expect(getPasswordInput()).toHaveFocus()
  await user.tab()
  expect(getConfirmPasswordInput()).toHaveFocus()
  await user.tab()
  expect(getSubmitButton()).toHaveFocus()
})

it('should mask password inputs', async () => {
  const { getPasswordInput, getConfirmPasswordInput } = await setup()

  expect(getPasswordInput()).toHaveAttribute('type', 'password')
  expect(getConfirmPasswordInput()).toHaveAttribute('type', 'password')
})

it('should require all inputs', async () => {
  const { getUsernameInput, getPasswordInput, getConfirmPasswordInput } = await setup()

  expect(getUsernameInput()).toHaveAttribute('required')
  expect(getPasswordInput()).toHaveAttribute('required')
  expect(getConfirmPasswordInput()).toHaveAttribute('required')
})

it('should show an error if the password and confirm password inputs do not match', async () => {
  const form = await superValidate(
    { username: '', password: { password: 'does not', confirmPassword: 'match' } },
    zod(signUpSchema),
  )

  const { getFormError } = await setup({ form })

  expect(getFormError()).toHaveTextContent('Passwords do not match')
})

it('should show an error if the username is already taken', async () => {
  const form = await superValidate(
    { username: '', password: { password: '', confirmPassword: '' } },
    zod(signUpSchema),
  )
  setError(form, 'username', 'Username is already taken')

  const { getFormError } = await setup({ form })

  expect(getFormError()).toHaveTextContent('Username is already taken')
})
