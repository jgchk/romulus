import type { Genre } from './genre'

export class GenreHistory {
  constructor(
    public name: string,
    public subtitle: string | undefined,
    public type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT',
    public nsfw: boolean,
    public shortDescription: string | undefined,
    public longDescription: string | undefined,
    public notes: string | undefined,

    public parents: Set<number>,
    public influences: Set<number>,
    public akas: {
      primary: string[]
      secondary: string[]
      tertiary: string[]
    },

    public genreId: number,
    public createdAt: Date,
    public operation: 'CREATE' | 'UPDATE' | 'DELETE',
    public accountId: number | undefined,
  ) {}

  static fromGenre(
    id: number,
    genre: Genre,
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
    accountId: number,
  ) {
    return new GenreHistory(
      genre.name,
      genre.subtitle,
      genre.type,
      genre.nsfw,
      genre.shortDescription,
      genre.longDescription,
      genre.notes,
      genre.parents,
      genre.influences,
      genre.akas,
      id,
      genre.createdAt,
      operation,
      accountId,
    )
  }
}
