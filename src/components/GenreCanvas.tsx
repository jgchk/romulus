import clsx from 'clsx'
import { FC, useMemo } from 'react'
import { DefaultGenre } from '../server/db/genre'

type PositionedGenre = Omit<DefaultGenre, 'x' | 'y'> & { x: number; y: number }

const isPositionedGenre = (genre: DefaultGenre): genre is PositionedGenre =>
  genre.x !== null && genre.y !== null

const GenreCanvas: FC<{ genres: DefaultGenre[] }> = ({ genres }) => {
  const [positionedGenres, unpositionedGenres] = useMemo(() => {
    const positioned: PositionedGenre[] = []
    const unpositioned: DefaultGenre[] = []

    for (const genre of genres) {
      if (isPositionedGenre(genre)) {
        positioned.push(genre)
      } else {
        unpositioned.push(genre)
      }
    }

    return [positioned, unpositioned]
  }, [genres])

  return (
    <div className='w-full h-full flex'>
      <div className='flex-1 bg-texture'>
        {positionedGenres.map((genre) => (
          <div
            key={genre.id}
            className={clsx(
              'p-1 border',
              `absolute top-[${genre.y}px] left-[${genre.x}px]`
            )}
          >
            {genre.name}
          </div>
        ))}
      </div>

      <div className='w-1/6 border-l shadow-sm p-4'>
        {unpositionedGenres.map((genre) => (
          <div
            key={genre.id}
            className={clsx(
              'rounded border flex items-center shadow-sm',
              `absolute top-[${genre.y}px] left-[${genre.x}px]`
            )}
          >
            <div className='flex items-center justify-center p-2 py-3 hover:bg-gray-100 cursor-pointer fill-gray-400'>
              <DragHandleIcon />
            </div>
            <div className='px-2 pr-3 text-gray-700'>{genre.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const DragHandleIcon: FC = () => (
  <svg viewBox='0 0 20 20' width='12'>
    <path d='M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z'></path>
  </svg>
)

export default GenreCanvas
