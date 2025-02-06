import type { Locator, Page } from '@playwright/test'

import { GenresPage } from './genres'

export class SignUpPage {
  static readonly url = '/sign-up'

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
    await this.page.goto(SignUpPage.url)
  }

  async signUp(username: string, password: string) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.confirmPasswordInput.fill(password)
    await this.submitButton.click()
    await this.page.waitForURL(GenresPage.url)
  }
}
