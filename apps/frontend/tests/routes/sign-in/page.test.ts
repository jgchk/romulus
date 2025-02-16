import { expect } from '@playwright/test'

import { test } from '../../fixtures'
import { GenresPage } from '../../fixtures/pages/genres'

const TEST_ACCOUNT = {
  username: 'test-username-sign-in',
  password: 'test-password-sign-in',
}

test('attempting to log in with a nonexistent username shows error message', async ({
  withAccount,
  signInPage,
}) => {
  await withAccount(TEST_ACCOUNT)
  await signInPage.goto()
  await signInPage.usernameInput.fill(TEST_ACCOUNT.username + '-invalid')
  await signInPage.passwordInput.fill(TEST_ACCOUNT.password)
  await signInPage.submitButton.click()
  await expect(signInPage.formError).toHaveText('Incorrect username or password')
})

test('attempting to log in with an incorrect password shows error message', async ({
  withAccount,
  signInPage,
}) => {
  await withAccount(TEST_ACCOUNT)
  await signInPage.goto()
  await signInPage.usernameInput.fill(TEST_ACCOUNT.username)
  await signInPage.passwordInput.fill(TEST_ACCOUNT.password + '-invalid')
  await signInPage.submitButton.click()
  await expect(signInPage.formError).toHaveText('Incorrect username or password')
})

test('attempting to log in with valid credentials redirects to the genres page', async ({
  withAccount,
  signInPage,
}) => {
  await withAccount(TEST_ACCOUNT)
  await signInPage.goto()
  await signInPage.usernameInput.fill(TEST_ACCOUNT.username)
  await signInPage.passwordInput.fill(TEST_ACCOUNT.password)
  await signInPage.submitButton.click()
  await expect(signInPage.page).toHaveURL(GenresPage.url)
})
