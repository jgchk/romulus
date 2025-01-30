import type { GenreTree } from './genre-tree.js'

export type GenreTreeRepository = {
  get(): Promise<GenreTree>
  save(genreTree: GenreTree): Promise<void>
}
