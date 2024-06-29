import type { Locator, Page } from '@playwright/test'

import type { GenreType } from '$lib/types/genres'

export type GenreFormData = {
  name?: string
  subtitle?: string
  akas?: { primary?: string; secondary?: string; tertiary?: string }
  type?: GenreType
  parents?: string[]
  influences?: string[]
  relevance?: number
  shortDescription?: string
  longDescription?: string
  notes?: string
}

export class GenreForm {
  readonly nameInput: Locator
  readonly subtitleInput: Locator
  readonly akaInputs: {
    primary: Locator
    secondary: Locator
    tertiary: Locator
  }
  readonly typeInput: Locator
  readonly parentsInput: Locator
  readonly selectedParents: Locator
  readonly influencesInput: Locator
  readonly selectedInfluences: Locator
  readonly relevanceInput: Locator
  readonly shortDescriptionInput: Locator
  readonly longDescriptionInput: Locator
  readonly notesInput: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator

  constructor(readonly page: Page) {
    this.nameInput = this.page.getByLabel('Name')
    this.subtitleInput = this.page.getByLabel('Subtitle')
    this.akaInputs = {
      primary: this.page.getByLabel('Primary'),
      secondary: this.page.getByLabel('Secondary'),
      tertiary: this.page.getByLabel('Tertiary'),
    }
    this.typeInput = this.page.getByLabel('Type')
    this.parentsInput = this.page.getByLabel('Parents')
    this.selectedParents = this.page.locator('.genre-parents .multiselect__selected')
    this.influencesInput = this.page.getByLabel('Influences')
    this.selectedInfluences = this.page.locator('.genre-influences .multiselect__selected')
    this.relevanceInput = this.page.getByLabel('Relevance')
    this.shortDescriptionInput = this.page.getByLabel('Short Description')
    this.longDescriptionInput = this.page.getByLabel('Long Description')
    this.notesInput = this.page.getByLabel('Notes')
    this.saveButton = this.page.getByRole('button', { name: 'Save' })
    this.cancelButton = this.page.getByRole('button', { name: 'Cancel' })
  }

  async fillForm(data: GenreFormData) {
    if (data.name) await this.nameInput.fill(data.name)
    if (data.subtitle) await this.subtitleInput.fill(data.subtitle)
    if (data.akas) {
      if (data.akas.primary) await this.akaInputs.primary.fill(data.akas.primary)
      if (data.akas.secondary) await this.akaInputs.secondary.fill(data.akas.secondary)
      if (data.akas.tertiary) await this.akaInputs.tertiary.fill(data.akas.tertiary)
    }
    if (data.type) await this.selectType(data.type)
    if (data.parents) await this.selectParents(data.parents)
    if (data.influences) await this.selectInfluences(data.influences)
    if (data.relevance !== undefined) await this.selectRelevance(data.relevance)
    if (data.shortDescription) await this.shortDescriptionInput.fill(data.shortDescription)
    if (data.longDescription) await this.longDescriptionInput.fill(data.longDescription)
    if (data.notes) await this.notesInput.fill(data.notes)
  }

  async selectType(type: GenreType) {
    await this.typeInput.click()
    await this.typeInput.fill(type)
    await this.typeInput.press('Enter')
  }

  async selectParents(parents: string[]) {
    await this.clearParents()
    for (const parent of parents) {
      await this.parentsInput.fill(parent)
      await this.parentsInput.press('Enter')
    }
  }

  async clearParents() {
    const selectedParent = this.selectedParents.first()
    while (await selectedParent.isVisible()) {
      await selectedParent.click()
    }
  }

  async selectInfluences(influences: string[]) {
    await this.clearInfluences()
    for (const influence of influences) {
      await this.influencesInput.fill(influence)
      await this.influencesInput.press('Enter')
    }
  }

  async clearInfluences() {
    const selectedInfluence = this.selectedInfluences.first()
    while (await selectedInfluence.isVisible()) {
      await selectedInfluence.click()
    }
  }

  async selectRelevance(relevance: number) {
    await this.relevanceInput.fill(`${relevance} -`)
    await this.relevanceInput.press('Enter')
  }
}
