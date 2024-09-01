import type { Genre } from '../../domain/genre'
import type { GenreTree } from '../../domain/genre-tree'

export type GenreRepository = {
  findById(id: number): Promise<Genre | undefined>
  getGenreTree(): Promise<GenreTree>
  update(id: number, genre: Genre): Promise<void>
}
