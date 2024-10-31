import type { Genre } from './genre'
import type { GenreTree } from './genre-tree'

export type GenreRepository = {
  findById(id: number): Promise<Genre | undefined>
  getGenreTree(): Promise<GenreTree>

  save(genre: Genre): Promise<{ id: number }>
}
