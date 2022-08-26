import clsx from 'clsx'
import Link from 'next/link'
import { equals, startsWith } from 'ramda'
import { FC, useEffect, useMemo, useState } from 'react'
import { RiArrowDownSLine, RiArrowRightSLine } from 'react-icons/ri'

import { isFullyVisible } from '../../utils/dom'
import { useGenrePageContext } from './context'
import GenreRelevanceChip from './GenreRelevanceChip'
import { useGenreTreeContext } from './GenreTreeContext'
import GenreTypeChip from './GenreTypeChip'
import { useExpandedGenres } from './useExpandedGenres'
import { TreeNode } from './useGenreTreeQuery'
import useGenreTreeSettings from './useGenreTreeSettings'

const GenreTreeNode: FC<{ node: TreeNode }> = ({
  node: { key, path, genre, children },
}) => {
  const { id, childGenres, parentGenres, name, subtitle, relevance } = genre
  const [expanded, setExpanded] = useExpandedGenres()

  const { selectedPath } = useGenrePageContext()

  const isExpanded = useMemo(() => {
    const value = expanded[key]

    if (value === 'expanded') {
      return true
    }

    if (selectedPath && startsWith(path, selectedPath.slice(0, -1))) {
      return true
    }

    return false
  }, [expanded, key, path, selectedPath])

  const { showTypeTags, showRelevanceTags } = useGenreTreeSettings()

  const isSelected = useMemo(
    () => selectedPath && equals(selectedPath, path),
    [path, selectedPath]
  )

  const [ref, setRef] = useState<HTMLLIElement | null>(null)
  const { treeEl } = useGenreTreeContext()
  useEffect(() => {
    if (isSelected && ref && treeEl) {
      const visible = isFullyVisible(ref, treeEl)
      if (!visible) {
        ref.scrollIntoView()
      }
    }
  }, [isSelected, ref, treeEl])

  return (
    <li
      ref={setRef}
      className={clsx(parentGenres.length > 0 && 'ml-4 border-l')}
    >
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
            pathname: '/genres',
            query: { id: id.toString(), path: key },
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
