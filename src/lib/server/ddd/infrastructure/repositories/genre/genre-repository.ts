import type { Genre } from '$lib/server/ddd/domain/genre'
import type { GenreTree } from '$lib/server/ddd/domain/genre-tree'

export type GenreRepository = {
  findById(id: number): Promise<Genre | undefined>
  getGenreTree(): Promise<GenreTree>
  update(id: number, genre: Genre): Promise<void>
}
