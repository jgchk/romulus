import clsx from 'clsx'
import {
  createContext,
  CSSProperties,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { DefaultGenre } from '../server/db/genre'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { useGenreMap } from '../utils/hooks'

const CANVAS_ID = 'canvas'
const UNPLACED_ID = 'unplaced'

type PositionedGenre = Omit<DefaultGenre, 'x' | 'y'> & { x: number; y: number }

const isPositionedGenre = (genre: DefaultGenre): genre is PositionedGenre =>
  genre.x !== null && genre.y !== null

type GenreCanvasContext = {
  activeId?: number
  activeGenre?: DefaultGenre
}

const GenreCanvasContext = createContext<GenreCanvasContext>({
  activeId: undefined,
  activeGenre: undefined,
})

const useCanvasContext = () => useContext(GenreCanvasContext)

const GenreCanvas: FC<{
  genres: DefaultGenre[]
  onChange: (genres: DefaultGenre[]) => void
}> = ({ genres, onChange }) => {
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

  const genreMap = useGenreMap(genres)

  const [activeId, setActiveId] = useState<number>()
  const activeGenre = useMemo(
    () => (activeId !== undefined ? genreMap[activeId] : undefined),
    [activeId, genreMap]
  )

  const updateGenrePosition = useCallback(
    (id: number, pos: { x: number; y: number } | null) => {
      const updatedGenres: DefaultGenre[] = genres.map((genre) => {
        if (genre.id !== id) {
          return genre
        }

        const updatedGenre = { ...genre }
        if (pos) {
          updatedGenre.x = pos.x
          updatedGenre.y = pos.y
        } else {
          updatedGenre.x = null
          updatedGenre.y = null
        }

        return updatedGenre
      })

      onChange(updatedGenres)
    },
    [genres, onChange]
  )

  return (
    <DndContext
      onDragStart={(e) => {
        const id = e.active.id
        if (typeof id === 'string') {
          setActiveId(Number.parseInt(id))
        } else {
          setActiveId(id)
        }
      }}
      onDragEnd={(e) => {
        if (e.over && activeId !== undefined) {
          if (e.over.id === CANVAS_ID) {
            const mouseEvent = e.activatorEvent
            if (!(mouseEvent instanceof MouseEvent)) {
              throw new TypeError('Drag activator event was not a mouse event')
            }

            const startPageX = mouseEvent.pageX
            const startPageY = mouseEvent.pageY

            const deltaX = e.delta.x
            const deltaY = e.delta.y

            const endPageX = startPageX + deltaX
            const endPageY = startPageY + deltaY

            const dropZoneX = e.over.rect.left
            const dropZoneY = e.over.rect.top

            const dropX = endPageX - dropZoneX
            const dropY = endPageY - dropZoneY

            updateGenrePosition(activeId, { x: dropX, y: dropY })
          } else if (e.over.id === UNPLACED_ID) {
            updateGenrePosition(activeId, null)
          }
        }

        setActiveId(undefined)
      }}
    >
      <GenreCanvasContext.Provider value={{ activeId, activeGenre }}>
        <div className='w-full h-full flex'>
          <Canvas genres={positionedGenres} />
          <UnplacedGenreSidebar genres={unpositionedGenres} />
        </div>
      </GenreCanvasContext.Provider>
    </DndContext>
  )
}

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

const UnplacedGenreSidebar: FC<{ genres: DefaultGenre[] }> = ({ genres }) => {
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

const GenreNode: FC<{ genre: DefaultGenre }> = ({ genre }) => {
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

export default GenreCanvas
