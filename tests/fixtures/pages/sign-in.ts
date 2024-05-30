import { Locator, Page } from '@playwright/test'

export class SignInPage {
  static readonly url = '/sign-in'

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
    await this.page.goto(SignInPage.url)
  }

  async signIn(username: string, password: string) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
