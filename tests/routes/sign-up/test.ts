import { expect, type Locator, type Page } from '@playwright/test'
import { eq } from 'drizzle-orm'

import { hashPassword } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts } from '$lib/server/db/schema'

import { test as base } from '../../fixtures'

class SignUpPage {
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly submitButton: Locator
  readonly formError: Locator

  constructor(readonly page: Page) {
    this.usernameInput = this.page.getByLabel('Username')
    this.passwordInput = this.page.getByLabel('Password', { exact: true })
    this.confirmPasswordInput = this.page.getByLabel('Confirm password')
    this.submitButton = this.page.getByRole('button', { name: 'Sign up' })
    this.formError = this.page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/sign-up')
  }
}

const test = base.extend<{ signInPage: SignUpPage }>({
  signInPage: async ({ page }, use) => {
    const signInPage = new SignUpPage(page)
    await signInPage.goto()
    await use(signInPage)
  },
})

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

test('should tab between username, password, confirm password, and submit fields', async ({
  page,
  signInPage,
}) => {
  await expect(signInPage.usernameInput).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(signInPage.passwordInput).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(signInPage.confirmPasswordInput).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(signInPage.submitButton).toBeFocused()
})

test('password inputs should be masked', async ({ signInPage }) => {
  await expect(signInPage.passwordInput).toHaveAttribute('type', 'password')
  await expect(signInPage.confirmPasswordInput).toHaveAttribute('type', 'password')
})

test('all inputs should be required', async ({ signInPage }) => {
  await expect(signInPage.usernameInput).toHaveAttribute('required')
  await expect(signInPage.passwordInput).toHaveAttribute('required')
  await expect(signInPage.confirmPasswordInput).toHaveAttribute('required')
})

test('should show error if password and confirm password do not match', async ({ signInPage }) => {
  await signInPage.usernameInput.fill(NEW_ACCOUNT.username)
  await signInPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signInPage.confirmPasswordInput.fill(NEW_ACCOUNT.password + '-different')
  await signInPage.submitButton.click()
  await expect(signInPage.formError).toContainText('Passwords do not match')
})

test('should show error if username is already taken', async ({ signInPage }) => {
  await signInPage.usernameInput.fill(EXISTING_ACCOUNT.username)
  await signInPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signInPage.confirmPasswordInput.fill(NEW_ACCOUNT.password)
  await signInPage.submitButton.click()
  await expect(signInPage.formError).toContainText('Username is already taken')
})

test('should require between 3 and 72 characters for username', async ({ signInPage }) => {
  await expect(signInPage.usernameInput).toHaveAttribute('minlength', '3')
  await expect(signInPage.usernameInput).toHaveAttribute('maxlength', '72')
})

test('should require between 8 and 72 characters for password', async ({ signInPage }) => {
  await expect(signInPage.passwordInput).toHaveAttribute('minlength', '8')
  await expect(signInPage.passwordInput).toHaveAttribute('maxlength', '72')
})

test('should redirect to genres page after successful sign up', async ({ page, signInPage }) => {
  await signInPage.usernameInput.fill(NEW_ACCOUNT.username)
  await signInPage.passwordInput.fill(NEW_ACCOUNT.password)
  await signInPage.confirmPasswordInput.fill(NEW_ACCOUNT.password)
  await signInPage.submitButton.click()
  await expect(page).toHaveURL('/genres')
})
