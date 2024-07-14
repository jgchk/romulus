import type { Page } from '@playwright/test'

import { GenreForm, type GenreFormData } from '../elements/genre-form'

export class EditGenrePage extends GenreForm {
  constructor(readonly page: Page) {
    super(page)
  }

  async editGenre(data: GenreFormData) {
    await this.fillForm(data)
    await this.saveButton.click()
    if (await this.confirmTopLevelButton.isVisible()) {
      await this.confirmTopLevelButton.click()
    }
  }

  async goto(id: number) {
    await this.page.goto(EditGenrePage.url(id))
  }

  static url(id: number) {
    return `/genres/${id}/edit`
  }
}
