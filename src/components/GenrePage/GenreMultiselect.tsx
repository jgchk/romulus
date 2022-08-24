import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RiArrowDownSLine, RiArrowUpSLine, RiCloseFill } from 'react-icons/ri'

import useDebounce from '../../hooks/useDebounce'
import useIdMap from '../../hooks/useIdMap'
import { SimpleGenre } from '../../server/db/genre/outputs'
import { Match, useSimpleGenreSearchQuery } from '../../services/genres'
import { CenteredLoader } from '../common/Loader'
import GenreTypeChip from './GenreTypeChip'
import useGenreTreeSettings from './useGenreTreeSettings'

const GenreMultiselect: FC<{
  id?: string
  selectedIds: number[]
  excludeIds?: number[]
  onChange: (value: number[]) => void
}> = ({ id, selectedIds, excludeIds, onChange }) => {
  const [inputValue, setInputValue] = useState('')
  const [debouncedFilter] = useDebounce(inputValue, 200)
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

  const genresQuery = useSimpleGenreSearchQuery(debouncedFilter)
  const genreMap = useIdMap(
    genresQuery.data?.map((match) => ({ ...match, id: match.genre.id })) ?? []
  )

  const options = useMemo(
    () =>
      genresQuery.data
        ?.filter(({ genre }) => {
          if (excludeIds && excludeIds.includes(genre.id)) return false
          if (selectedIds.includes(genre.id)) return false
          return true
        })
        .slice(0, 100),
    [excludeIds, genresQuery.data, selectedIds]
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
      <Option
        key={item.genre.id}
        match={item}
        onClick={() => {
          selectId(item.genre.id)
          setInputValue('')
        }}
      />
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
              genre={genreMap.get(id)?.genre}
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
                selectId(topOption.genre.id)
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

const Option: FC<{
  match?: Match
  onClick: () => void
}> = ({ match, onClick }) => {
  const { showTypeTags } = useGenreTreeSettings()

  return (
    <li className='group hover:bg-gray-100'>
      <button
        className='w-full text-left text-sm text-gray-700 px-2 py-1 border-b border-gray-200 group-last:border-0'
        type='button'
        onClick={() => onClick()}
      >
        {match?.genre.name ?? 'Loading...'}
        {match?.genre.subtitle && (
          <>
            {' '}
            <span className='text-xs text-gray-600'>
              [{match.genre.subtitle}]
            </span>
          </>
        )}
        {match?.matchedAka && (
          <>
            {' '}
            <span className='text-xs'>({match.matchedAka})</span>
          </>
        )}
        {showTypeTags && match?.genre.type && match?.genre.type !== 'STYLE' && (
          <>
            {' '}
            <GenreTypeChip type={match?.genre.type} />
          </>
        )}
      </button>
    </li>
  )
}

const SelectedGenre: FC<{ genre?: SimpleGenre; onRemove: () => void }> = ({
  genre,
  onRemove,
}) => {
  const { showTypeTags } = useGenreTreeSettings()

  return (
    <div className='flex border border-gray-400 bg-gray-200 text-gray-600 rounded-sm'>
      <div className='px-2 py-0.5 text-sm font-medium'>
        {genre?.name ?? 'Loading...'}
        {genre?.subtitle && (
          <>
            {' '}
            <span className='text-xs text-gray-500'>[{genre.subtitle}]</span>
          </>
        )}
        {showTypeTags && genre && genre.type !== 'STYLE' && (
          <>
            {' '}
            <GenreTypeChip type={genre.type} className='bg-gray-300' />
          </>
        )}
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
}

export default GenreMultiselect
