import type { Locator, Page } from '@playwright/test'

import { GenreTree } from '../elements/genre-tree'

export class GenresPage {
  static readonly url = '/genres'

  readonly navigator: {
    settingsButton: Locator
    tree: GenreTree
    search: {
      input: Locator
      emptyState: Locator
      createGenreLink: Locator
    }
    createGenreButton: Locator
  }

  constructor(readonly page: Page) {
    this.navigator = {
      settingsButton: this.page.getByLabel('Genre Settings'),
      tree: new GenreTree(this.page),
      search: {
        input: this.page.getByLabel('Search Genres'),
        emptyState: this.page
          .getByLabel('Genre Search Results')
          .locator(this.page.getByText('No genres found')),
        createGenreLink: this.page
          .getByLabel('Genre Search Results')
          .locator(this.page.getByRole('link', { name: 'Create one.' })),
      },
      createGenreButton: this.page.getByRole('button', { name: 'New Genre' }),
    }
  }

  async goto() {
    await this.page.goto(GenresPage.url)
  }
}
