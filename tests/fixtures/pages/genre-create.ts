import { Page } from '@playwright/test'

export class CreateGenrePage {
  static readonly url = '/genres/create'

  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto(CreateGenrePage.url)
  }
}
