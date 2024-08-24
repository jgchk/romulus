import { expect } from '@playwright/test'

import { test } from '../../fixtures'
import { GenresPage } from '../../fixtures/pages/genres'
import { SignInPage } from '../../fixtures/pages/sign-in'
import { deleteAccounts } from '../../utils'

const EXISTING_ACCOUNT = {
  username: 'existing-username-sign-up',
  password: 'existing-password-sign-up',
}

const NEW_ACCOUNT = {
  username: 'test-username-sign-up',
  password: 'test-password-sign-up',
}

test.afterEach(async ({ dbConnection }) => {
  await deleteAccounts([NEW_ACCOUNT.username], dbConnection)
})

test('should tab between username, password, confirm password, and submit fields', async ({
  signUpPage,
}) => {
  await signUpPage.goto()
  await expect(signUpPage.usernameInput).toBeFocused()
  await signUpPage.page.keyboard.press('Tab')
  await expect(signUpPage.passwordInput).toBeFocused()
  await signUpPage.page.keyboard.press('Tab')
  await expect(signUpPage.confirmPasswordInput).toBeFocused()
  await signUpPage.page.keyboard.press('Tab')
  await expect(signUpPage.submitButton).toBeFocused()
})

test('password inputs should be masked', async ({ signUpPage }) => {
  await signUpPage.goto()
  await expect(signUpPage.passwordInput).toHaveAttribute('type', 'password')
  await expect(signUpPage.confirmPasswordInput).toHaveAttribute('type', 'password')
})

test('all inputs should be required', async ({ signUpPage }) => {
  await signUpPage.goto()
  await expect(signUpPage.usernameInput).toHaveAttribute('required')
  await expect(signUpPage.passwordInput).toHaveAttribute('required')
  await expect(signUpPage.confirmPasswordInput).toHaveAttribute('required')
})

test('should show error if password and confirm password do not match', async ({ signUpPage }) => {
  await signUpPage.goto()
  await signUpPage.usernameInput.fill(NEW_ACCOUNT.username)
  await signUpPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.confirmPasswordInput.fill(NEW_ACCOUNT.password + '-different')
  await signUpPage.submitButton.click()
  await expect(signUpPage.formError).toContainText('Passwords do not match')
})

test('should show error if username is already taken', async ({ withAccount, signUpPage }) => {
  await withAccount(EXISTING_ACCOUNT)
  await signUpPage.goto()
  await signUpPage.usernameInput.fill(EXISTING_ACCOUNT.username)
  await signUpPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.confirmPasswordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.submitButton.click()
  await expect(signUpPage.formError).toContainText('Username is already taken')
})

test('should require between 3 and 72 characters for username', async ({ signUpPage }) => {
  await signUpPage.goto()
  await expect(signUpPage.usernameInput).toHaveAttribute('minlength', '3')
  await expect(signUpPage.usernameInput).toHaveAttribute('maxlength', '72')
})

test('should require between 8 and 72 characters for password', async ({ signUpPage }) => {
  await signUpPage.goto()
  await expect(signUpPage.passwordInput).toHaveAttribute('minlength', '8')
  await expect(signUpPage.passwordInput).toHaveAttribute('maxlength', '72')
})

test('should redirect to genres page after successful sign up', async ({ signUpPage }) => {
  await signUpPage.goto()
  await signUpPage.usernameInput.fill(NEW_ACCOUNT.username)
  await signUpPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.confirmPasswordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.submitButton.click()
  await expect(signUpPage.page).toHaveURL(GenresPage.url)
})

test('should be able to log in after successful sign up', async ({
  signUpPage,
  signInPage,
  navbar,
}) => {
  await signUpPage.goto()
  await signUpPage.usernameInput.fill(NEW_ACCOUNT.username)
  await signUpPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.confirmPasswordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.submitButton.click()
  await expect(signUpPage.page).toHaveURL(GenresPage.url)

  await navbar.accountDropdown.click()
  await navbar.logOutButton.click()
  await expect(navbar.accountDropdown).not.toBeVisible()

  await signInPage.goto()
  await signInPage.usernameInput.fill(NEW_ACCOUNT.username)
  await signInPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signInPage.submitButton.click()
  await expect(signInPage.page).toHaveURL(GenresPage.url)
})
