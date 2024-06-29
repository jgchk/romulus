import { expect, type Locator, type Page } from '@playwright/test'

import { getGenreRelevanceText } from '$lib/types/genres'
import { capitalize } from '$lib/utils/string'

import type { GenreFormData } from '../elements/genre-form'

export class GenreDetailsPage {
  readonly name: Locator
  readonly subtitle: Locator
  readonly akas: Locator
  readonly type: Locator
  readonly parents: Locator
  readonly influences: Locator
  readonly influenced: Locator
  readonly shortDescription: Locator
  readonly longDescription: Locator

  readonly notes: Locator
  readonly showNotesButton: Locator
  readonly hideNotesButton: Locator

  readonly contributors: Locator

  readonly relevance: Locator
  readonly voteButton: Locator
  readonly voteInput: Locator
  readonly submitVoteButton: Locator
  readonly cancelVoteButton: Locator

  readonly historyButton: Locator
  readonly editButton: Locator
  readonly deleteButton: Locator
  readonly deleteDialogDeleteButton: Locator

  constructor(readonly page: Page) {
    this.name = this.page.locator('.genre-name')
    this.subtitle = this.page.locator('.genre-subtitle')
    this.akas = this.page.locator('.genre-akas')
    this.type = this.page.locator('.genre-type')
    this.parents = this.page.locator('.genre-parents')
    this.influences = this.page.locator('.genre-influences')
    this.influenced = this.page.locator('.genre-influenced')
    this.shortDescription = this.page.locator('.genre-short-description')
    this.longDescription = this.page.locator('.genre-long-description')

    this.notes = this.page.locator('.genre-notes')
    this.showNotesButton = this.page.getByRole('button', { name: 'Show notes' })
    this.hideNotesButton = this.page.getByRole('button', { name: 'Hide notes' })

    this.contributors = this.page.locator('.genre-contributors')

    this.relevance = this.page.locator('.genre-relevance')
    this.voteButton = this.page.getByRole('button', { name: '(Vote)' })
    this.voteInput = this.page.getByLabel('Your Vote')
    this.submitVoteButton = this.page.getByRole('button', { name: 'Vote', exact: true })
    this.cancelVoteButton = this.page.getByRole('button', { name: '(Cancel)' })

    this.historyButton = this.page.getByRole('link', { name: 'History' })
    this.editButton = this.page.getByRole('link', { name: 'Edit' })
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

  async edit() {
    await this.editButton.click()
  }

  async delete() {
    await this.deleteButton.click()
    await this.deleteDialogDeleteButton.click()
  }

  async vote(relevance: number) {
    await this.voteButton.click()
    await this.voteInput.click()
    await this.page
      .locator('.select__list')
      .getByText(`${relevance} - ${getGenreRelevanceText(relevance)}`)
      .click()
    await this.submitVoteButton.click()
  }

  async expectGenreData(genre: GenreFormData) {
    if (genre.name) await expect(this.name).toHaveText(genre.name)
    if (genre.subtitle) await expect(this.subtitle).toHaveText(`[${genre.subtitle}]`)
    if (genre.akas)
      await expect(this.akas).toHaveText(
        [genre.akas.primary, genre.akas.secondary, genre.akas.tertiary].join(', '),
      )
    if (genre.type) await expect(this.type).toHaveText(capitalize(genre.type))
    if (genre.parents) await expect(this.parents).toHaveText(genre.parents.join(', '))
    if (genre.influences) await expect(this.influences).toHaveText(genre.influences.join(', '))
    if (genre.relevance !== undefined)
      await expect(this.relevance).toContainText(
        `${genre.relevance} - ${getGenreRelevanceText(genre.relevance)}`,
      )
    if (genre.shortDescription)
      await expect(this.shortDescription).toHaveText(genre.shortDescription)
    if (genre.longDescription) await expect(this.longDescription).toHaveText(genre.longDescription)
    if (genre.notes) {
      await this.showNotesButton.click()
      await expect(this.notes).toHaveText(genre.notes)
    }
  }
}
