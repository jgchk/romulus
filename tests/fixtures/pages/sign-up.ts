import { Locator, Page } from '@playwright/test'

export class SignUpPage {
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
