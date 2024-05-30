import { expect } from '@playwright/test'

import { test } from '../../fixtures'
import { GenresPage } from '../../fixtures/pages/genres'
import { createAccounts, deleteAccounts } from '../../utils'

const TEST_ACCOUNT = {
  username: 'test-username-sign-in',
  password: 'test-password-sign-in',
}

test.beforeAll(async () => {
  await createAccounts([TEST_ACCOUNT])
})

test.afterAll(async () => {
  await deleteAccounts([TEST_ACCOUNT.username])
})

test.beforeEach(async ({ signInPage }) => {
  await signInPage.goto()
})

test('should tab between username, password, and submit fields', async ({ signInPage }) => {
  await expect(signInPage.usernameInput).toBeFocused()
  await signInPage.page.keyboard.press('Tab')
  await expect(signInPage.passwordInput).toBeFocused()
  await signInPage.page.keyboard.press('Tab')
  await expect(signInPage.submitButton).toBeFocused()
})

test('password input should be masked', async ({ signInPage }) => {
  await expect(signInPage.passwordInput).toHaveAttribute('type', 'password')
})

test('username and password inputs should be required', async ({ signInPage }) => {
  await expect(signInPage.usernameInput).toHaveAttribute('required')
  await expect(signInPage.passwordInput).toHaveAttribute('required')
})

test('attempting to log in with a nonexistent username shows error message', async ({
  signInPage,
}) => {
  await signInPage.usernameInput.fill(TEST_ACCOUNT.username + '-invalid')
  await signInPage.passwordInput.fill(TEST_ACCOUNT.password)
  await signInPage.submitButton.click()
  await expect(signInPage.formError).toHaveText('Incorrect username or password')
})

test('attempting to log in with an incorrect password shows error message', async ({
  signInPage,
}) => {
  await signInPage.usernameInput.fill(TEST_ACCOUNT.username)
  await signInPage.passwordInput.fill(TEST_ACCOUNT.password + '-invalid')
  await signInPage.submitButton.click()
  await expect(signInPage.formError).toHaveText('Incorrect username or password')
})

test('attempting to log in with valid credentials redirects to the genres page', async ({
  signInPage,
}) => {
  await signInPage.usernameInput.fill(TEST_ACCOUNT.username)
  await signInPage.passwordInput.fill(TEST_ACCOUNT.password)
  await signInPage.submitButton.click()
  await expect(signInPage.page).toHaveURL(GenresPage.url)
})
