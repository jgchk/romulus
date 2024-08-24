type Permission = 'EDIT_GENRES' | 'EDIT_RELEASES' | 'EDIT_ARTISTS'

type AccountProps = {
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

type AccountUpdate = {
  username?: string
  passwordHash?: string
  darkMode?: boolean | null
  permissions?: Set<Permission> | null
  genreRelevanceFilter?: number | null
  showRelevanceTags?: boolean | null
  showTypeTags?: boolean | null
  showNsfw?: boolean | null
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

  withUpdate(data: AccountUpdate): NewAccount {
    return new NewAccount({
      username: data.username ?? this.username,
      passwordHash: data.passwordHash ?? this.passwordHash,
      darkMode: data.darkMode === undefined ? this.darkMode : (data.darkMode ?? undefined),
      permissions:
        data.permissions === undefined ? this.permissions : (data.permissions ?? undefined),
      genreRelevanceFilter:
        data.genreRelevanceFilter === undefined
          ? this.genreRelevanceFilter
          : (data.genreRelevanceFilter ?? undefined),
      showRelevanceTags:
        data.showRelevanceTags === undefined
          ? this.showRelevanceTags
          : (data.showRelevanceTags ?? undefined),
      showTypeTags:
        data.showTypeTags === undefined ? this.showTypeTags : (data.showTypeTags ?? undefined),
      showNsfw: data.showNsfw === undefined ? this.showNsfw : (data.showNsfw ?? undefined),
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }
}

export class CreatedAccount extends NewAccount {
  public readonly id: number

  constructor(id: number, props: AccountProps) {
    super(props)
    this.id = id
  }
}
