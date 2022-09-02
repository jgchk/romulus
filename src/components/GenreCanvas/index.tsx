import { DndContext } from '@dnd-kit/core'
import { FC, useCallback, useMemo, useState } from 'react'

import useIdMap from '../../hooks/useIdMap'
import { DefaultGenre } from '../../server/db/genre/outputs'
import Canvas from './Canvas'
import { CanvasContextProvider } from './CanvasContext'
import {
  CANVAS_ID,
  isPositionedGenre,
  PositionedGenre,
  UNPLACED_ID,
} from './common'
import Sidebar from './Sidebar'

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

  const genreMap = useIdMap(genres)

  const [activeId, setActiveId] = useState<number>()
  const activeGenre = useMemo(
    () => (activeId !== undefined ? genreMap.get(activeId) : undefined),
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
          if (e.over.id === UNPLACED_ID) {
            updateGenrePosition(activeId, null)
            return
          }

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
          }
        }

        setActiveId(undefined)
      }}
    >
      <CanvasContextProvider activeId={activeId} activeGenre={activeGenre}>
        <div className='flex h-full w-full'>
          <Canvas genres={positionedGenres} />
          <Sidebar genres={unpositionedGenres} />
        </div>
      </CanvasContextProvider>
    </DndContext>
  )
}

export default GenreCanvas
