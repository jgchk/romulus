import { DefaultGenre } from '../../server/db/genre'

export const CANVAS_ID = 'canvas'
export const UNPLACED_ID = 'unplaced'

export type PositionedGenre = Omit<DefaultGenre, 'x' | 'y'> & {
  x: number
  y: number
}

export const isPositionedGenre = (
  genre: DefaultGenre
): genre is PositionedGenre => genre.x !== null && genre.y !== null
