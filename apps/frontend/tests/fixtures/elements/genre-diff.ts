import { expect, type Locator } from '@playwright/test'

export class GenreDiffEntry {
  readonly operation: Locator
  readonly account: Locator
  readonly time: Locator

  readonly name: Locator
  readonly subtitle: Locator
  readonly type: Locator
  readonly akas: Locator
  readonly parents: Locator
  readonly influences: Locator
  readonly shortDescription: Locator
  readonly longDescription: Locator
  readonly notes: Locator

  constructor(readonly element: Locator) {
    this.operation = this.element.getByTestId('genre-diff-operation')
    this.account = this.element.getByTestId('genre-diff-account')
    this.time = this.element.getByTestId('genre-diff-time')

    this.name = this.element.getByTestId('genre-diff-name')
    this.subtitle = this.element.getByTestId('genre-diff-subtitle')
    this.type = this.element.getByTestId('genre-diff-type')
    this.akas = this.element.getByTestId('genre-diff-akas')
    this.parents = this.element.getByTestId('genre-diff-parents')
    this.influences = this.element.getByTestId('genre-diff-influences')
    this.shortDescription = this.element.getByTestId('genre-diff-short-description')
    this.longDescription = this.element.getByTestId('genre-diff-long-description')
    this.notes = this.element.getByTestId('genre-diff-notes')
  }

  async expectData(data: {
    operation?: string
    account?: string
    time?: string

    name?: string
    subtitle?: string
    type?: string
    akas?: string
    parents?: string
    influences?: string
    shortDescription?: string
    longDescription?: string
    notes?: string
  }): Promise<void> {
    if (data.operation) {
      await expect(this.operation).toHaveText(data.operation)
    }
    if (data.account) {
      await expect(this.account).toHaveText(data.account)
    }
    if (data.time) {
      await expect(this.time).toHaveText(data.time)
    }
    if (data.name) {
      await expect(this.name).toHaveText(data.name)
    }
    if (data.subtitle) {
      await expect(this.subtitle).toHaveText(data.subtitle)
    }
    if (data.type) {
      await expect(this.type).toHaveText(data.type)
    }
    if (data.akas) {
      await expect(this.akas).toHaveText(data.akas)
    }
    if (data.parents) {
      await expect(this.parents).toHaveText(data.parents)
    }
    if (data.influences) {
      await expect(this.influences).toHaveText(data.influences)
    }
    if (data.shortDescription) {
      await expect(this.shortDescription).toHaveText(data.shortDescription)
    }
    if (data.longDescription) {
      await expect(this.longDescription).toHaveText(data.longDescription)
    }
    if (data.notes) {
      await expect(this.notes).toHaveText(data.notes)
    }
  }
}
