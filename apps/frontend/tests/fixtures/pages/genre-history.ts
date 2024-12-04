import type { Locator, Page } from '@playwright/test'

export class GenreHistoryPage {
  readonly entries: Locator

  constructor(readonly page: Page) {
    this.entries = this.page.locator('.genre-diff')
  }

  static url(id: number) {
    return `/genres/${id}/history`
  }

  async goto(id: number) {
    await this.page.goto(GenreHistoryPage.url(id))
  }
}
