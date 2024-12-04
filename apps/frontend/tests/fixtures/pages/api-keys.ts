import { type Locator, type Page } from '@playwright/test'

export class ApiKeysPage {
  createButton: Locator
  nameInput: Locator
  confirmCreateButton: Locator
  deleteButton: Locator
  confirmDeleteButton: Locator
  copyButton: Locator
  apiPlaygroundLink: Locator

  constructor(readonly page: Page) {
    this.createButton = this.page.getByRole('button', { name: 'Create an API key' })
    this.nameInput = this.page.getByLabel('Name')
    this.confirmCreateButton = this.page.getByRole('button', { name: 'Create', exact: true })
    this.deleteButton = this.page.getByRole('button', { name: 'Delete' })
    this.confirmDeleteButton = this.page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Delete' })
    this.copyButton = this.page.getByRole('button', { name: 'Copy' })
    this.apiPlaygroundLink = this.page.getByRole('link', { name: 'API Playground' })
  }

  static url(accountId: number) {
    return `/accounts/${accountId}/keys`
  }

  async goto(accountId: number) {
    await this.page.goto(ApiKeysPage.url(accountId))
  }
}
