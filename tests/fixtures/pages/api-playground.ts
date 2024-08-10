import { type Locator, type Page } from '@playwright/test'

export class ApiPlaygroundPage {
  authorizeButton: Locator
  tokenInput: Locator
  applyCredentialsButton: Locator
  closeButton: Locator
  requestButton: (request: string) => Locator
  tryItOutButton: Locator
  executeButton: Locator
  responseCode: Locator

  constructor(readonly page: Page) {
    this.authorizeButton = this.page.getByRole('button', { name: 'Authorize' })
    this.tokenInput = this.page.getByLabel('auth-bearer-value')
    this.applyCredentialsButton = this.page.getByLabel('Apply credentials')
    this.closeButton = this.page.getByRole('button', { name: 'Close' })
    this.requestButton = (request: string) =>
      this.page.getByRole('button', { name: request }).first()
    this.tryItOutButton = this.page.getByRole('button', { name: 'Try it out' })
    this.executeButton = this.page.getByRole('button', { name: 'Execute' })
    this.responseCode = this.page.locator('.live-responses-table .response .response-col_status')
  }

  static url = '/api/openapi'

  async goto() {
    await this.page.goto(ApiPlaygroundPage.url)
  }
}
