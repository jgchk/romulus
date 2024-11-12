import type { GenreTree } from './genre-tree'

export type GenreTreeRepository = {
  get(): Promise<GenreTree>
  save(genreTree: GenreTree): Promise<void>
}
