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
    filter,
    genreMap,
    expanded,
    setExpanded,
    descendants: allDescendants,
    filterMatches,
  } = useTreeContext()

  const genre = useMemo(() => genreMap[id], [genreMap, id])

  const genreName = useMemo(() => {
    if (!filter) return genre.name

    const match = filterMatches[genre.id]
    if (!match?.name && match?.aka) {
      return (
        <>
          {genre.name} <span className='text-sm'>({match.aka})</span>
        </>
      )
    }

    return genre.name
  }, [filter, filterMatches, genre.id, genre.name])

  const descendants = useMemo(
    () => allDescendants[genre.id],
    [allDescendants, genre.id]
  )

  const isExpanded = useMemo(() => {
    if (expanded[genre.id] === 'expanded') return true

    if (expanded[genre.id] === undefined) {
      if (selectedId !== undefined && descendants.includes(selectedId))
        return true
      if (descendants.some((id) => filterMatches[id])) return true
    }

    return false
  }, [descendants, expanded, filterMatches, genre.id, selectedId])

  const children = useMemo(() => {
    let matchingChildren = genre.childGenres
    if (filter) {
      matchingChildren = matchingChildren.filter((g) => {
        return [g.id, ...allDescendants[g.id]].some((id) => filterMatches[id])
      })
    }
    return matchingChildren.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    )
  }, [allDescendants, filter, filterMatches, genre.childGenres])

  const { showTypeTags } = useGenreTreeSettings()

  return (
    <li
      className={clsx(
        genre.parentGenres.length > 0 && 'ml-4 border-l',
        genre.parentGenres.some(({ id }) => selectedId === id) &&
          'border-gray-400',
        filter && filterMatches[genre.id] && 'font-bold'
      )}
      key={genre.id}
    >
      <div className='ml-1 flex space-x-1'>
        <button
          className={clsx(
            'p-1 hover:bg-blue-100 hover:text-blue-600 rounded-sm text-gray-500',
            genre.childGenres.length === 0 && 'invisible'
          )}
          onClick={() =>
            setExpanded({
              ...expanded,
              [genre.id]: isExpanded ? 'collapsed' : 'expanded',
            })
          }
        >
          {isExpanded ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
        </button>
        <Link
          href={{
            pathname: '/genres/[id]',
            query: { id: genre.id.toString() },
          }}
        >
          <a
            className={
              selectedId === genre.id
                ? 'text-blue-600 font-bold'
                : 'text-gray-600'
            }
          >
            {genreName}
            {showTypeTags && genre.type !== 'STYLE' && (
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
