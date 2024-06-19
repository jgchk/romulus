import type { Locator, Page } from '@playwright/test'

export class GenreDetailsPage {
  readonly voteButton: Locator
  readonly voteInput: Locator
  readonly submitVoteButton: Locator
  readonly cancelVoteButton: Locator
  readonly editButton: Locator
  readonly deleteButton: Locator
  readonly deleteDialogDeleteButton: Locator

  constructor(readonly page: Page) {
    this.voteButton = this.page.getByRole('button', { name: '(Vote)' })
    this.voteInput = this.page.getByLabel('Your Vote')
    this.submitVoteButton = this.page.getByRole('button', { name: 'Vote', exact: true })
    this.cancelVoteButton = this.page.getByRole('button', { name: '(Cancel)' })
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
    await this.voteInput.fill(`${relevance} - `)
    await this.voteInput.press('Enter')
    await this.submitVoteButton.click()
    await this.cancelVoteButton.click()
  }
}
