import { type Genre } from './genre.js'

export type GenreRepository = {
  findById(id: number): Promise<Genre | undefined>
  save(genre: Genre): Promise<{ id: number }>
  delete(id: number): Promise<void>
}
