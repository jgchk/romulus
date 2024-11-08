export type Permission = 'EDIT_GENRES' | 'EDIT_RELEASES' | 'EDIT_ARTISTS'

export type AccountProps = {
  username: string
  passwordHash: string
  darkMode?: boolean
  permissions?: Set<Permission>
  genreRelevanceFilter?: number
  showRelevanceTags?: boolean
  showTypeTags?: boolean
  showNsfw?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class NewAccount {
  public username: string
  public passwordHash: string
  public darkMode: boolean
  public permissions: Set<Permission>
  public genreRelevanceFilter: number
  public showRelevanceTags: boolean
  public showTypeTags: boolean
  public showNsfw: boolean
  public createdAt: Date
  public updatedAt: Date

  constructor(props: AccountProps) {
    this.username = props.username
    this.passwordHash = props.passwordHash
    this.darkMode = props.darkMode ?? true
    this.permissions = props.permissions ?? new Set()
    this.genreRelevanceFilter = props.genreRelevanceFilter ?? 0
    this.showRelevanceTags = props.showRelevanceTags ?? false
    this.showTypeTags = props.showTypeTags ?? true
    this.showNsfw = props.showNsfw ?? false
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  resetPassword(newPasswordHash: string): NewAccount {
    return new NewAccount({
      ...this,
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    })
  }

  updateSettings(
    settings: Partial<
      Pick<AccountProps, 'genreRelevanceFilter' | 'showRelevanceTags' | 'showTypeTags' | 'showNsfw'>
    >,
  ): NewAccount {
    return new NewAccount({
      ...this,
      ...settings,
      updatedAt: new Date(),
    })
  }

  unmarshal(): AccountProps {
    return {
      username: this.username,
      passwordHash: this.passwordHash,
      darkMode: this.darkMode,
      permissions: this.permissions,
      genreRelevanceFilter: this.genreRelevanceFilter,
      showRelevanceTags: this.showRelevanceTags,
      showTypeTags: this.showTypeTags,
      showNsfw: this.showNsfw,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export class CreatedAccount extends NewAccount {
  public readonly id: number

  constructor(id: number, props: AccountProps) {
    super(props)
    this.id = id
  }

  unmarshal(): AccountProps & { id: number } {
    return {
      ...super.unmarshal(),
      id: this.id,
    }
  }
}
