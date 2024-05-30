import { Locator, Page } from '@playwright/test'

export class SignInPage {
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
