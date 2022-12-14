import clsx from 'clsx'
import Link from 'next/link'
import { equals } from 'ramda'
import { FC, useEffect, useMemo, useState } from 'react'
import { RiArrowDownSLine, RiArrowRightSLine } from 'react-icons/ri'

import { isFullyVisible } from '../../../../utils/dom'
import IconButton from '../../../common/IconButton'
import GenreTypeChip from '../../GenreTypeChip'
import useGenreNavigatorSettings from '../useGenreNavigatorSettings'
import RelevanceChip from './RelevanceChip'
import { TreeNode } from './useGenreTreeQuery'
import { useGenreTreeRef } from './useGenreTreeRef'
import { useGenreTreeState } from './useGenreTreeState'

const GenreTreeNode: FC<{ node: TreeNode }> = ({
  node: { key, path, genre, children },
}) => {
  const { id, childGenres, parentGenres, name, subtitle, relevance } = genre

  const { selectedPath, setSelectedPath, expanded, setExpanded } =
    useGenreTreeState()

  const isExpanded = useMemo(
    () => expanded[key] === 'expanded',
    [expanded, key]
  )

  const { showTypeTags, showRelevanceTags } = useGenreNavigatorSettings()

  const isSelected = useMemo(
    () => selectedPath && equals(selectedPath, path),
    [path, selectedPath]
  )

  const [ref, setRef] = useState<HTMLLIElement | null>(null)
  const treeRef = useGenreTreeRef()
  useEffect(() => {
    if (isSelected && ref && treeRef) {
      const visible = isFullyVisible(ref, treeRef)
      if (!visible) {
        ref.scrollIntoView()
      }
    }
  }, [isSelected, ref, treeRef])

  return (
    <li
      ref={setRef}
      className={clsx(parentGenres.length > 0 && 'ml-4 border-l')}
    >
      <div className='ml-1 flex space-x-1'>
        <IconButton
          size='sm'
          className={clsx(
            'text-gray-500',
            childGenres.length === 0 && 'invisible'
          )}
          onClick={() =>
            setExpanded(key, isExpanded ? 'collapsed' : 'expanded')
          }
        >
          {isExpanded ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
        </IconButton>
        <Link
          href={{
            pathname: '/genres',
            query: { id: id.toString() },
          }}
        >
          <a
            onClick={() => setSelectedPath(path)}
            className={clsx(
              'hover:font-bold',
              isSelected ? 'font-bold text-primary-600' : 'text-gray-600'
            )}
          >
            {name}
            {subtitle && (
              <>
                {' '}
                <span
                  className={clsx(
                    'text-sm',
                    isSelected ? 'text-primary-500' : 'text-gray-500'
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
                <RelevanceChip relevance={relevance} />
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
