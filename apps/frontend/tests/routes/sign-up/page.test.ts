import { expect } from '@playwright/test'

import { test } from '../../fixtures'
import { GenresPage } from '../../fixtures/pages/genres'

const EXISTING_ACCOUNT = {
  username: 'existing-username-sign-up',
  password: 'existing-password-sign-up',
}

const NEW_ACCOUNT = {
  username: 'test-username-sign-up',
  password: 'test-password-sign-up',
}

test('should show error if password and confirm password do not match', async ({ signUpPage }) => {
  await signUpPage.goto()
  await signUpPage.usernameInput.fill(NEW_ACCOUNT.username)
  await signUpPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.confirmPasswordInput.fill(NEW_ACCOUNT.password + '-different')
  await signUpPage.submitButton.click()
  await expect(signUpPage.formError).toContainText('Passwords do not match')
})

test('should show error if username is already taken', async ({ signUpPage, navbar }) => {
  await signUpPage.goto()
  await signUpPage.signUp(EXISTING_ACCOUNT.username, EXISTING_ACCOUNT.password)
  await navbar.signOut()

  await signUpPage.goto()
  await signUpPage.usernameInput.fill(EXISTING_ACCOUNT.username)
  await signUpPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.confirmPasswordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.submitButton.click()
  await expect(signUpPage.formError).toContainText('Username is already taken')
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

  await navbar.signOut()

  await signInPage.goto()
  await signInPage.usernameInput.fill(NEW_ACCOUNT.username)
  await signInPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signInPage.submitButton.click()
  await expect(signInPage.page).toHaveURL(GenresPage.url)
})
