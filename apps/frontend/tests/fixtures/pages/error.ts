import { expect, type Locator, type Page } from '@playwright/test'

export class ErrorPage {
  readonly status: Locator
  readonly message: Locator

  constructor(readonly page: Page) {
    this.status = this.page.getByRole('heading')
    this.message = this.page.locator('p')
  }

  async expectError(status: string, message: string) {
    await expect(this.status).toHaveText(status)
    await expect(this.message).toHaveText(message)
  }
}
