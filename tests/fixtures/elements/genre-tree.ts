import type { Locator, Page } from '@playwright/test'

export class GenreTree {
  readonly emptyState: Locator
  readonly createGenreLink: Locator
  readonly genres: Locator

  constructor(readonly page: Page) {
    this.emptyState = this.page
      .getByLabel('Genre Tree')
      .locator(this.page.getByText('No genres found'))
    this.createGenreLink = this.page
      .getByLabel('Genre Tree')
      .locator(this.page.getByRole('link', { name: 'Create one.' }))
    this.genres = this.page.getByLabel('Genre Tree').locator('.genre-tree-node')
  }
}

export class GenreTreeGenre {
  link: Locator
  name: Locator
  expandButton: Locator
  collapseButton: Locator
  expandCollapseButton: Locator
  typeChip: Locator
  relevanceChip: Locator
  subtitle: Locator

  constructor(readonly element: Locator) {
    this.link = element.getByRole('link')
    this.name = element.locator('.genre-tree-node__name')
    this.expandButton = element.getByRole('button', { name: 'Expand' })
    this.collapseButton = element.getByRole('button', { name: 'Collapse' })
    this.expandCollapseButton = this.expandButton.or(this.collapseButton)
    this.typeChip = element.locator('.genre-type-chip')
    this.relevanceChip = element.locator('.genre-relevance-chip')
    this.subtitle = element.locator('.genre-tree-node__subtitle')
  }
}
