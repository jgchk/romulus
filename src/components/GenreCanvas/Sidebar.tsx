import { useDroppable } from '@dnd-kit/core'
import clsx from 'clsx'
import { FC } from 'react'

import { DefaultGenre } from '../../server/db/genre/outputs'
import { UNPLACED_ID } from './common'
import GenreNode from './GenreNode'

const Sidebar: FC<{ genres: DefaultGenre[] }> = ({ genres }) => {
  const { isOver, setNodeRef } = useDroppable({ id: UNPLACED_ID })

  return (
    <div
      className={clsx('w-1/6 border-l shadow-sm p-4', isOver && 'bg-gray-100')}
      ref={setNodeRef}
    >
      {genres.map((genre) => (
        <GenreNode key={genre.id} genre={genre} />
      ))}
    </div>
  )
}

export default Sidebar
