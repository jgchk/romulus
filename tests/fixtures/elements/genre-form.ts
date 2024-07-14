import { expect, type Locator, type Page } from '@playwright/test'

import { type GenreType, getGenreRelevanceText } from '$lib/types/genres'
import { capitalize } from '$lib/utils/string'

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
  readonly parentsOptions: Locator
  readonly influencesInput: Locator
  readonly selectedInfluences: Locator
  readonly influencesOptions: Locator
  readonly relevanceInput: Locator
  readonly shortDescriptionInput: Locator
  readonly longDescriptionInput: Locator
  readonly notesInput: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator
  readonly confirmTopLevelButton: Locator
  readonly cancelTopLevelButton: Locator

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
    this.selectedParents = this.page.locator('.genre-parents').getByTestId('multiselect__selected')
    this.parentsOptions = this.page.locator('.genre-parents').getByTestId('multiselect__option')
    this.influencesInput = this.page.getByLabel('Influences')
    this.selectedInfluences = this.page
      .locator('.genre-influences')
      .getByTestId('multiselect__selected')
    this.influencesOptions = this.page
      .locator('.genre-influences')
      .getByTestId('multiselect__option')
    this.relevanceInput = this.page.getByLabel('Relevance')
    this.shortDescriptionInput = this.page.getByLabel('Short Description')
    this.longDescriptionInput = this.page.getByLabel('Long Description')
    this.notesInput = this.page.getByLabel('Notes')
    this.saveButton = this.page.getByRole('button', { name: 'Save' })
    this.cancelButton = this.page.getByRole('button', { name: 'Cancel' })
    this.confirmTopLevelButton = this.page.getByRole('button', { name: 'Yes' })
    this.cancelTopLevelButton = this.page.getByRole('button', { name: 'No' })
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
    await this.page.locator('.select__list').getByText(capitalize(type)).click()
  }

  async selectRelevance(relevance: number) {
    await this.relevanceInput.click()
    await this.page
      .locator('.select__list')
      .getByText(`${relevance} - ${getGenreRelevanceText(relevance)}`)
      .click()
  }

  async selectParents(parents: string[]) {
    await this.clearParents()
    for (const parent of parents) {
      await this.parentsInput.fill(parent)
      await expect(this.parentsOptions.first()).toHaveText(parent)
      await this.parentsOptions.first().click()
    }
    await this.parentsInput.press('Escape')
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
      await expect(this.influencesOptions.first()).toHaveText(influence)
      await this.influencesOptions.first().click()
    }
    await this.influencesInput.press('Escape')
  }

  async clearInfluences() {
    const selectedInfluence = this.selectedInfluences.first()
    while (await selectedInfluence.isVisible()) {
      await selectedInfluence.click()
    }
  }
}
