import type { Locator } from '@playwright/test'

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
    this.operation = this.element.locator('.genre-diff__operation')
    this.account = this.element.locator('.genre-diff__account')
    this.time = this.element.locator('.genre-diff__time')

    this.name = this.element.locator('.genre-diff__name')
    this.subtitle = this.element.locator('.genre-diff__subtitle')
    this.type = this.element.locator('.genre-diff__type')
    this.akas = this.element.locator('.genre-diff__akas')
    this.parents = this.element.locator('.genre-diff__parents')
    this.influences = this.element.locator('.genre-diff__influences')
    this.shortDescription = this.element.locator('.genre-diff__short-description')
    this.longDescription = this.element.locator('.genre-diff__long-description')
    this.notes = this.element.locator('.genre-diff__notes')
  }
}
