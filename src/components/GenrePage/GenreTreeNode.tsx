import clsx from 'clsx'
import Link from 'next/link'
import { equals, startsWith } from 'ramda'
import { FC, useMemo, useRef } from 'react'
import { RiArrowDownSLine, RiArrowRightSLine } from 'react-icons/ri'

import { useGenrePageContext } from './context'
import GenreRelevanceChip from './GenreRelevanceChip'
import GenreTypeChip from './GenreTypeChip'
import { useExpandedGenres } from './useExpandedGenres'
import { TreeNode } from './useGenreTreeQuery'
import useGenreTreeSettings from './useGenreTreeSettings'

const GenreTreeNode: FC<{ node: TreeNode }> = ({
  node: { key, path, genre, children },
}) => {
  const { id, childGenres, parentGenres, name, subtitle, relevance } = genre
  const [expanded, setExpanded] = useExpandedGenres()

  const { selectedPath, setSelectedPath } = useGenrePageContext()

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

  const ref = useRef<HTMLLIElement>(null)
  // useEffect(() => {
  //   if (scrollTo === id && ref.current) {
  //     ref.current.scrollIntoView()
  //   }
  // }, [id, scrollTo])

  return (
    <li ref={ref} className={clsx(parentGenres.length > 0 && 'ml-4 border-l')}>
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
            query: { id: id.toString() },
          }}
        >
          <a
            className={clsx(
              'hover:font-bold',
              isSelected ? 'text-blue-600 font-bold' : 'text-gray-600'
            )}
            onClick={() => setSelectedPath(path)}
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
