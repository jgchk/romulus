import { type Locator, type Page } from '@playwright/test'

export class ApiKeysPage {
  createButton: Locator
  nameInput: Locator
  confirmCreateButton: Locator
  deleteButton: Locator

  constructor(readonly page: Page) {
    this.createButton = this.page.getByRole('button', { name: 'Create a key' })
    this.nameInput = this.page.getByLabel('Name')
    this.confirmCreateButton = this.page.getByRole('button', { name: 'Create', exact: true })
    this.deleteButton = this.page.getByRole('button', { name: 'Delete' })
  }

  static url(accountId: number) {
    return `/accounts/${accountId}/keys`
  }

  async goto(accountId: number) {
    await this.page.goto(ApiKeysPage.url(accountId))
  }
}
