import type { Locator, Page } from '@playwright/test'

export class GenreDetailsPage {
  readonly deleteButton: Locator
  readonly deleteDialogDeleteButton: Locator

  constructor(readonly page: Page) {
    this.deleteButton = this.page.getByRole('button', { name: 'Delete' })
    this.deleteDialogDeleteButton = this.page
      .locator('form')
      .getByRole('button', { name: 'Delete' })
  }

  static url(id: number) {
    return `/genres/${id}`
  }

  async goto(id: number) {
    await this.page.goto(GenreDetailsPage.url(id))
  }

  async delete() {
    await this.deleteButton.click()
    await this.deleteDialogDeleteButton.click()
  }
}
