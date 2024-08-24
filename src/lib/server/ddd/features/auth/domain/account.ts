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
}

export class CreatedAccount extends NewAccount {
  public readonly id: number

  constructor(id: number, props: AccountProps) {
    super(props)
    this.id = id
  }

  static fromNewAccount(id: number, newAccount: NewAccount): CreatedAccount {
    return new CreatedAccount(id, {
      username: newAccount.username,
      passwordHash: newAccount.passwordHash,
      darkMode: newAccount.darkMode,
      permissions: newAccount.permissions,
      genreRelevanceFilter: newAccount.genreRelevanceFilter,
      showRelevanceTags: newAccount.showRelevanceTags,
      showTypeTags: newAccount.showTypeTags,
      showNsfw: newAccount.showNsfw,
      createdAt: newAccount.createdAt,
      updatedAt: newAccount.updatedAt,
    })
  }
}
