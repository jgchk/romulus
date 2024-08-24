type Permission = 'EDIT_GENRES' | 'EDIT_RELEASES' | 'EDIT_ARTISTS'

type AccountProps = {
  username: string
  passwordHash: string
  darkMode?: boolean
  permissions?: Permission[]
  genreRelevanceFilter?: number
  showRelevanceTags?: boolean
  showTypeTags?: boolean
  showNsfw?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class Account {
  public username: string
  public passwordHash: string
  public darkMode: boolean
  public permissions: Permission[]
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
    this.permissions = props.permissions ?? []
    this.genreRelevanceFilter = props.genreRelevanceFilter ?? 0
    this.showRelevanceTags = props.showRelevanceTags ?? false
    this.showTypeTags = props.showTypeTags ?? true
    this.showNsfw = props.showNsfw ?? false
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }
}
