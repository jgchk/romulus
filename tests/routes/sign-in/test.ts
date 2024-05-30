import { expect } from '@playwright/test'
import { eq } from 'drizzle-orm'

import { hashPassword } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts } from '$lib/server/db/schema'

import { test } from '../../fixtures'

const TEST_ACCOUNT = {
  username: 'test-username',
  password: 'test-password',
}

test.beforeAll(async () => {
  await db.insert(accounts).values({
    username: TEST_ACCOUNT.username,
    password: await hashPassword(TEST_ACCOUNT.password),
  })
})

test.afterAll(async () => {
  await db.delete(accounts).where(eq(accounts.username, TEST_ACCOUNT.username))
})

test.beforeEach(async ({ signInPage }) => {
  await signInPage.goto()
})

test('should tab between username, password, and submit fields', async ({ page, signInPage }) => {
  await expect(signInPage.usernameInput).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(signInPage.passwordInput).toBeFocused()
  await page.keyboard.press('Tab')
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
  page,
  signInPage,
}) => {
  await signInPage.usernameInput.fill(TEST_ACCOUNT.username)
  await signInPage.passwordInput.fill(TEST_ACCOUNT.password)
  await signInPage.submitButton.click()
  await expect(page).toHaveURL('/genres')
})
