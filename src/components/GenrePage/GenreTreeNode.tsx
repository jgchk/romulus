import clsx from 'clsx'
import Link from 'next/link'
import { FC, useMemo } from 'react'
import { RiArrowDownSLine, RiArrowRightSLine } from 'react-icons/ri'

import GenreRelevanceChip from './GenreRelevanceChip'
import { Node, useTreeContext } from './GenreTreeContext'
import GenreTypeChip from './GenreTypeChip'
import useGenreTreeSettings from './useGenreTreeSettings'

const GenreTreeNode: FC<{ node: Node }> = ({
  node: { key, genre, descendants, children },
}) => {
  const { id, childGenres, parentGenres, name, subtitle, relevance } = genre
  const { selectedId, expanded, setExpanded } = useTreeContext()

  const isExpanded = useMemo(() => {
    const value = expanded[key]

    if (value === 'expanded') {
      return true
    }

    if (
      value === undefined &&
      selectedId !== undefined &&
      descendants?.includes(selectedId)
    ) {
      return true
    }

    return false
  }, [descendants, expanded, key, selectedId])

  const { showTypeTags, showRelevanceTags } = useGenreTreeSettings()

  const isSelected = useMemo(() => selectedId === id, [id, selectedId])

  return (
    <li className={clsx(parentGenres.length > 0 && 'ml-4 border-l')}>
      <div className='ml-1 flex space-x-1'>
        <button
          className={clsx(
            'p-1 hover:bg-blue-100 hover:text-blue-600 rounded-sm text-gray-500',
            childGenres.length === 0 && 'invisible'
          )}
          onClick={() =>
            setExpanded({
              ...expanded,
              [key]: isExpanded ? 'collapsed' : 'expanded',
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
              isSelected ? 'text-blue-600 font-bold' : 'text-gray-600'
            )}
          >
            {name}
            {subtitle && (
              <>
                {' '}
                <span
                  className={clsx(
                    'text-sm',
                    isSelected ? 'text-blue-500' : 'text-gray-500'
                  )}
                >
                  [{subtitle}]
                </span>
              </>
            )}
            {showTypeTags && genre.type !== 'STYLE' && (
              <>
                {' '}
                <GenreTypeChip type={genre.type} />
              </>
            )}
            {showRelevanceTags && (
              <>
                {' '}
                <GenreRelevanceChip relevance={relevance} />
              </>
            )}
          </a>
        </Link>
      </div>
      {isExpanded && children.length > 0 && (
        <ul>
          {children.map((node) => (
            <GenreTreeNode key={node.key} node={node} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default GenreTreeNode
