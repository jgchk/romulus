import { useDraggable } from '@dnd-kit/core'
import { CSSProperties, FC, useMemo } from 'react'

import { DefaultGenre } from '../../server/db/genre/types'
import { isPositionedGenre } from './common'

export const GenreNode: FC<{ genre: DefaultGenre }> = ({ genre }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: genre.id,
  })

  const pos = useMemo(
    () => (isPositionedGenre(genre) ? { x: genre.x, y: genre.y } : undefined),
    [genre]
  )

  const style: CSSProperties = useMemo(
    () => ({
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
      position: pos ? 'absolute' : undefined,
      left: pos?.x,
      top: pos?.y,
    }),
    [pos, transform]
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className='genre-node rounded border flex w-fit items-center shadow-sm bg-white'
    >
      <div className='flex items-center justify-center p-2 py-3 hover:bg-gray-100 cursor-pointer fill-gray-400'>
        <DragHandleIcon />
      </div>
      <div className='px-2 pr-3 text-gray-700'>{genre.name}</div>
    </div>
  )
}

const DragHandleIcon: FC = () => (
  <svg viewBox='0 0 20 20' width='12'>
    <path d='M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z'></path>
  </svg>
)

export default GenreNode
