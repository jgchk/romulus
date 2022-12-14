import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RiArrowDownSLine, RiArrowUpSLine, RiCloseFill } from 'react-icons/ri'

import useIdMap from '../../hooks/useIdMap'
import { SimpleArtist } from '../../server/db/artist/output'
import { useSimpleArtistsQuery } from '../../services/artists'
import { toAscii } from '../../utils/string'
import { CenteredLoader } from '../common/Loader'

const ArtistMultiselect: FC<{
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

  const artistsQuery = useSimpleArtistsQuery()
  const artistMap = useIdMap(artistsQuery.data ?? [])

  const options = useMemo(
    () =>
      artistsQuery.data
        ?.filter(
          (artist) =>
            !(excludeIds ?? []).includes(artist.id) &&
            !selectedIds.includes(artist.id) &&
            toAscii(artist.name.toLowerCase()).includes(
              toAscii(inputValue.toLowerCase())
            )
        )
        .sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        ),
    [excludeIds, artistsQuery.data, inputValue, selectedIds]
  )

  const renderOptions = useCallback(() => {
    if (!options) {
      return <CenteredLoader className='m-2' />
    }

    if (options.length === 0) {
      return (
        <div className='px-2 py-1 text-sm text-gray-700'>No artists found</div>
      )
    }

    return options.map((item) => (
      <Option
        key={item.id}
        artist={item}
        onClick={() => {
          selectId(item.id)
          setInputValue('')
        }}
      />
    ))
  }, [options, selectId])

  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className='relative' ref={containerRef}>
      <div className='flex rounded-sm border bg-white outline-1 focus-within:border-black focus-within:outline'>
        <div
          className='flex w-full flex-1 flex-wrap gap-1 p-1'
          onClick={() => {
            setOpen(!open)
            inputRef.current?.focus()
          }}
        >
          {selectedIds.map((id) => (
            <SelectedArtist
              key={id}
              artist={artistMap.get(id)}
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
          className='border-l border-gray-200 px-1 text-gray-400 hover:bg-gray-100'
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
          className='absolute z-10 max-h-64 w-full overflow-auto border bg-white shadow-sm'
          style={{ top: 'calc(100% - 1px)' }}
        >
          {renderOptions()}
        </ul>
      )}
    </div>
  )
}

const Option: FC<{
  artist?: SimpleArtist
  onClick: () => void
}> = ({ artist, onClick }) => (
  <li className='group hover:bg-gray-100'>
    <button
      className='w-full border-b border-gray-200 px-2 py-1 text-left text-sm text-gray-700 group-last:border-0'
      type='button'
      onClick={() => onClick()}
    >
      {artist?.name ?? 'Loading...'}
    </button>
  </li>
)

const SelectedArtist: FC<{ artist?: SimpleArtist; onRemove: () => void }> = ({
  artist,
  onRemove,
}) => (
  <div className='flex rounded-sm border border-gray-400 bg-gray-200 text-gray-600'>
    <div className='flex items-center px-2 py-0.5 text-sm font-medium'>
      {artist?.name ?? 'Loading...'}
    </div>
    <button
      className='h-full border-l border-gray-300 px-1 hover:bg-gray-300'
      type='button'
      onClick={() => onRemove()}
      tabIndex={-1}
    >
      <RiCloseFill />
    </button>
  </div>
)

export default ArtistMultiselect
