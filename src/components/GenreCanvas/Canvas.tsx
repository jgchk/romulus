import { useDroppable } from '@dnd-kit/core'
import { FC } from 'react'
import { CANVAS_ID, PositionedGenre } from './common'
import GenreNode from './GenreNode'

const Canvas: FC<{ genres: PositionedGenre[] }> = ({ genres }) => {
  const { setNodeRef } = useDroppable({ id: CANVAS_ID })

  return (
    <div className='flex-1 bg-texture relative' ref={setNodeRef}>
      {genres.map((genre) => (
        <GenreNode key={genre.id} genre={genre} />
      ))}
    </div>
  )
}

export default Canvas
