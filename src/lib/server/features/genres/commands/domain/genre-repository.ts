import type { Genre } from './genre'
import type { GenreTree } from './genre-tree'

export type GenreRepository = {
  findById(id: number): Promise<Genre | undefined>
  save(genre: Genre): Promise<{ id: number }>
  delete(id: number): Promise<void>

  getGenreTree(): Promise<GenreTree>
  saveGenreTree(genreTree: GenreTree): Promise<void>
}
