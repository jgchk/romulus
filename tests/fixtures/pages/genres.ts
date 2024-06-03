import type { Locator, Page } from '@playwright/test'

export class GenresPage {
  static readonly url = '/genres'

  readonly navigator: {
    settingsButton: Locator
    tree: {
      emptyState: Locator
      createGenreLink: Locator
      genreLinks: Locator
    }
    search: {
      input: Locator
      emptyState: Locator
      createGenreLink: Locator
    }
  }

  constructor(readonly page: Page) {
    this.navigator = {
      settingsButton: this.page.getByLabel('Genre Settings'),
      tree: {
        emptyState: this.page
          .getByLabel('Genre Tree')
          .locator(this.page.getByText('No genres found')),
        createGenreLink: this.page
          .getByLabel('Genre Tree')
          .locator(this.page.getByRole('link', { name: 'Create one.' })),
        genreLinks: this.page.getByLabel('Genre Tree').locator('.genre-tree-link'),
      },
      search: {
        input: this.page.getByLabel('Search Genres'),
        emptyState: this.page
          .getByLabel('Genre Search Results')
          .locator(this.page.getByText('No genres found')),
        createGenreLink: this.page
          .getByLabel('Genre Search Results')
          .locator(this.page.getByRole('link', { name: 'Create one.' })),
      },
    }
  }

  async goto() {
    await this.page.goto(GenresPage.url)
  }
}
