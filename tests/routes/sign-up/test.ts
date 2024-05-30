import { expect } from '@playwright/test'
import { eq } from 'drizzle-orm'

import { hashPassword } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts } from '$lib/server/db/schema'

import { test } from '../../fixtures'

const EXISTING_ACCOUNT = {
  username: 'existing-username',
  password: 'existing-password',
}

const NEW_ACCOUNT = {
  username: 'test-username',
  password: 'test-password',
}

test.beforeAll(async () => {
  await db.insert(accounts).values({
    username: EXISTING_ACCOUNT.username,
    password: await hashPassword(EXISTING_ACCOUNT.password),
  })
})

test.afterAll(async () => {
  await db.delete(accounts).where(eq(accounts.username, EXISTING_ACCOUNT.username))
})

test.beforeEach(async ({ signUpPage }) => {
  await signUpPage.goto()
})

test('should tab between username, password, confirm password, and submit fields', async ({
  page,
  signUpPage,
}) => {
  await expect(signUpPage.usernameInput).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(signUpPage.passwordInput).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(signUpPage.confirmPasswordInput).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(signUpPage.submitButton).toBeFocused()
})

test('password inputs should be masked', async ({ signUpPage }) => {
  await expect(signUpPage.passwordInput).toHaveAttribute('type', 'password')
  await expect(signUpPage.confirmPasswordInput).toHaveAttribute('type', 'password')
})

test('all inputs should be required', async ({ signUpPage }) => {
  await expect(signUpPage.usernameInput).toHaveAttribute('required')
  await expect(signUpPage.passwordInput).toHaveAttribute('required')
  await expect(signUpPage.confirmPasswordInput).toHaveAttribute('required')
})

test('should show error if password and confirm password do not match', async ({ signUpPage }) => {
  await signUpPage.usernameInput.fill(NEW_ACCOUNT.username)
  await signUpPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.confirmPasswordInput.fill(NEW_ACCOUNT.password + '-different')
  await signUpPage.submitButton.click()
  await expect(signUpPage.formError).toContainText('Passwords do not match')
})

test('should show error if username is already taken', async ({ signUpPage }) => {
  await signUpPage.usernameInput.fill(EXISTING_ACCOUNT.username)
  await signUpPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.confirmPasswordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.submitButton.click()
  await expect(signUpPage.formError).toContainText('Username is already taken')
})

test('should require between 3 and 72 characters for username', async ({ signUpPage }) => {
  await expect(signUpPage.usernameInput).toHaveAttribute('minlength', '3')
  await expect(signUpPage.usernameInput).toHaveAttribute('maxlength', '72')
})

test('should require between 8 and 72 characters for password', async ({ signUpPage }) => {
  await expect(signUpPage.passwordInput).toHaveAttribute('minlength', '8')
  await expect(signUpPage.passwordInput).toHaveAttribute('maxlength', '72')
})

test('should redirect to genres page after successful sign up', async ({ page, signUpPage }) => {
  await signUpPage.usernameInput.fill(NEW_ACCOUNT.username)
  await signUpPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.confirmPasswordInput.fill(NEW_ACCOUNT.password)
  await signUpPage.submitButton.click()
  await expect(page).toHaveURL('/genres')
})
