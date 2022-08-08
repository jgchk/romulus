import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RiArrowDownSLine, RiArrowUpSLine, RiCloseFill } from 'react-icons/ri'

import { DefaultGenre } from '../../server/db/genre'
import { useGenresQuery } from '../../services/genres'
import { useGenreMap } from '../../utils/hooks'
import { CenteredLoader } from '../common/Loader'

const GenreMultiselect: FC<{
  id?: string
  selectedIds: number[]
  excludeIds?: number[]
  onChange: (value: number[]) => void
}> = ({ id, selectedIds, excludeIds, onChange }) => {
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (inputValue.length > 0) {
      setOpen(true)
    }
  }, [inputValue.length])

  const selectId = useCallback(
    (id: number) => onChange([...selectedIds, id]),
    [onChange, selectedIds]
  )

  const unselectId = useCallback(
    (id: number) =>
      onChange(selectedIds.filter((selectedId) => selectedId !== id)),
    [onChange, selectedIds]
  )

  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (
        containerRef.current &&
        e.target &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('click', listener)
    return () => document.removeEventListener('click', listener)
  }, [])

  const genresQuery = useGenresQuery()
  const genreMap = useGenreMap(genresQuery.data ?? [])

  const options = useMemo(
    () =>
      genresQuery.data?.filter(
        (genre) =>
          !(excludeIds ?? []).includes(genre.id) &&
          !selectedIds.includes(genre.id) &&
          genre.name.toLowerCase().startsWith(inputValue.toLowerCase())
      ),
    [excludeIds, genresQuery.data, inputValue, selectedIds]
  )

  const renderOptions = useCallback(() => {
    if (!options) {
      return <CenteredLoader className='m-2' />
    }

    if (options.length === 0) {
      return (
        <div className='px-2 py-1 text-sm text-gray-700'>No genres found</div>
      )
    }

    return options.map((item) => (
      <li className='group hover:bg-gray-100' key={item.id}>
        <button
          className='w-full text-left text-sm text-gray-700 px-2 py-1 border-b border-gray-200 group-last:border-0'
          type='button'
          onClick={() => {
            selectId(item.id)
            setInputValue('')
          }}
        >
          {item.name}
        </button>
      </li>
    ))
  }, [options, selectId])

  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className='relative' ref={containerRef}>
      <div className='flex bg-white border focus-within:outline outline-1 focus-within:border-black rounded-sm'>
        <div
          className='flex-1 flex flex-wrap gap-1 w-full p-1'
          onClick={() => {
            setOpen(!open)
            inputRef.current?.focus()
          }}
        >
          {selectedIds.map((id) => (
            <SelectedGenre
              key={id}
              genre={genreMap[id]}
              onRemove={() => unselectId(id)}
            />
          ))}
          <input
            ref={inputRef}
            id={id}
            className='flex-1 border border-transparent focus:outline-none'
            placeholder='Search...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab' || e.key === 'Enter') {
                const topOption = options?.[0]
                if (
                  (inputValue.length === 0 && !open) ||
                  topOption === undefined
                ) {
                  setOpen(false)
                  return
                }

                e.preventDefault()
                selectId(topOption.id)
                setInputValue('')
                setOpen(false)
              } else if (
                e.key === 'Backspace' &&
                inputValue.length === 0 &&
                selectedIds.length > 0
              ) {
                e.preventDefault()
                unselectId(selectedIds[selectedIds.length - 1])
              }
            }}
            autoComplete='off'
          />
        </div>
        <button
          className='px-1 border-l text-gray-400 border-gray-200 hover:bg-gray-100'
          type='button'
          onClick={() => {
            setOpen(!open)
            inputRef.current?.focus()
          }}
          tabIndex={-1}
        >
          {open ? (
            <RiArrowUpSLine className='pointer-events-none' />
          ) : (
            <RiArrowDownSLine className='pointer-events-none' />
          )}
        </button>
      </div>
      {open && (
        <ul
          className='absolute z-10 w-full bg-white border shadow-sm max-h-64 overflow-auto'
          style={{ top: 'calc(100% - 1px)' }}
        >
          {renderOptions()}
        </ul>
      )}
    </div>
  )
}

const SelectedGenre: FC<{ genre: DefaultGenre; onRemove: () => void }> = ({
  genre,
  onRemove,
}) => (
  <div className='flex border border-gray-400 bg-gray-200 text-gray-600 rounded-sm'>
    <div className='flex items-center px-2 py-0.5 text-sm font-medium'>
      {genre.name}
    </div>
    <button
      className='border-l h-full px-1 border-gray-300 hover:bg-gray-300'
      type='button'
      onClick={() => onRemove()}
      tabIndex={-1}
    >
      <RiCloseFill />
    </button>
  </div>
)

export default GenreMultiselect
