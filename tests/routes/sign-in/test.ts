import { expect, type Locator, type Page } from '@playwright/test'
import { eq } from 'drizzle-orm'

import { hashPassword } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts } from '$lib/server/db/schema'

import { test as base } from '../../fixtures'

class SignInPage {
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly formError: Locator

  constructor(readonly page: Page) {
    this.usernameInput = this.page.getByLabel('Username')
    this.passwordInput = this.page.getByLabel('Password')
    this.submitButton = this.page.getByRole('button', { name: 'Sign in' })
    this.formError = this.page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/sign-in')
  }
}

const test = base.extend<{ signInPage: SignInPage }>({
  signInPage: async ({ page }, use) => {
    const signInPage = new SignInPage(page)
    await signInPage.goto()
    await use(signInPage)
  },
})

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

test('should tab between username, password, and submit fields', async ({ page, signInPage }) => {
  await expect(signInPage.usernameInput).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(signInPage.passwordInput).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(signInPage.submitButton).toBeFocused()
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

test('password input should be masked', async ({ signInPage }) => {
  const inputType = await signInPage.passwordInput.getAttribute('type')
  expect(inputType).toBe('password')
})

test('username and password inputs should be required', async ({ signInPage }) => {
  await expect(signInPage.usernameInput).toHaveAttribute('required')
  await expect(signInPage.passwordInput).toHaveAttribute('required')
})
