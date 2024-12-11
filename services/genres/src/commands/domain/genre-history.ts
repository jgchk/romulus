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
    public derivedFrom: Set<number>,
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
    parents: Set<number>,
    derivedFrom: Set<number>,
    influences: Set<number>,
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
      parents,
      derivedFrom,
      influences,
      genre.akas,
      id,
      new Date(),
      operation,
      accountId,
    )
  }
}
