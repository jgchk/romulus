import type { Genre } from './genre'
import type { GenreTree } from './genre-tree'

export type GenreRepository = {
  findById(id: number): Promise<Genre | undefined>
  getGenreTree(): Promise<GenreTree>
  update(id: number, genre: Genre): Promise<void>
}
