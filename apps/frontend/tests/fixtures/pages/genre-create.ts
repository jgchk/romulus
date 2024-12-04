import type { Page } from '@playwright/test'

import { GenreForm, type GenreFormData } from '../elements/genre-form'

export class CreateGenrePage extends GenreForm {
  static readonly url = '/genres/create'

  constructor(readonly page: Page) {
    super(page)
  }

  async createGenre(data: GenreFormData) {
    await this.fillForm(data)
    await this.saveButton.click()
    if (await this.confirmTopLevelButton.isVisible()) {
      await this.confirmTopLevelButton.click()
    }
  }

  async goto() {
    await this.page.goto(CreateGenrePage.url)
  }
}
