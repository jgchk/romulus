import clsx from 'clsx'
import Link from 'next/link'
import { FC, useMemo } from 'react'
import { RiArrowDownSLine, RiArrowRightSLine } from 'react-icons/ri'

import { useGenreTreeSettings } from './common'
import { useTreeContext } from './GenreTreeContext'
import GenreTypeChip from './GenreTypeChip'

const GenreTreeNode: FC<{ id: number }> = ({ id }) => {
  const {
    selectedId,
    genreMap,
    expanded,
    setExpanded,
    descendants: allDescendants,
  } = useTreeContext()

  const genre = useMemo(() => genreMap.get(id), [genreMap, id])

  const descendants = useMemo(
    () => allDescendants.get(id),
    [allDescendants, id]
  )

  const isExpanded = useMemo(() => {
    if (expanded[id] === 'expanded') return true

    if (
      expanded[id] === undefined &&
      selectedId !== undefined &&
      descendants?.includes(selectedId)
    )
      return true

    return false
  }, [descendants, expanded, id, selectedId])

  const children = useMemo(
    () =>
      genre?.childGenres.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      ) ?? [],
    [genre?.childGenres]
  )

  const { showTypeTags } = useGenreTreeSettings()

  return (
    <li
      className={clsx(
        genre && genre.parentGenres.length > 0 && 'ml-4 border-l',
        genre &&
          genre.parentGenres.some(({ id }) => selectedId === id) &&
          'border-gray-400'
      )}
    >
      <div className='ml-1 flex space-x-1'>
        <button
          className={clsx(
            'p-1 hover:bg-blue-100 hover:text-blue-600 rounded-sm text-gray-500',
            genre && genre.childGenres.length === 0 && 'invisible'
          )}
          onClick={() =>
            setExpanded({
              ...expanded,
              [id]: isExpanded ? 'collapsed' : 'expanded',
            })
          }
        >
          {isExpanded ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
        </button>
        <Link
          href={{
            pathname: '/genres/[id]',
            query: { id: id.toString() },
          }}
        >
          <a
            className={clsx(
              'hover:font-bold',
              selectedId === id ? 'text-blue-600 font-bold' : 'text-gray-600'
            )}
          >
            {genre?.name ?? 'Loading...'}
            {showTypeTags && genre && genre.type !== 'STYLE' && (
              <>
                {' '}
                <GenreTypeChip type={genre.type} />
              </>
            )}
          </a>
        </Link>
      </div>
      {isExpanded && children.length > 0 && (
        <ul>
          {children.map(({ id }) => (
            <GenreTreeNode key={id} id={id} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default GenreTreeNode
