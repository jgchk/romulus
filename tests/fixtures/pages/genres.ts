import { Locator, Page } from '@playwright/test'

export class GenresPage {
  static readonly url = '/genres'

  readonly navigator: {
    tree: {
      emptyState: Locator
      createGenreLink: Locator
    }
  }

  constructor(readonly page: Page) {
    this.navigator = {
      tree: {
        emptyState: this.page
          .getByLabel('Genre Tree')
          .locator(this.page.getByText('No genres found')),
        createGenreLink: this.page
          .getByLabel('Genre Tree')
          .locator(this.page.getByRole('link', { name: 'Create one.' })),
      },
    }
  }

  async goto() {
    await this.page.goto(GenresPage.url)
  }
}
