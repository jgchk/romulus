import clsx from 'clsx'
import Link from 'next/link'
import { equals } from 'ramda'
import { FC, useEffect, useState } from 'react'
import { RiArrowDownSLine, RiArrowRightSLine } from 'react-icons/ri'

import { TreeGenre } from '../../../../server/db/genre/outputs'
import { useTreeGenreChildrenQuery } from '../../../../services/genres'
import { isFullyVisible } from '../../../../utils/dom'
import IconButton from '../../../common/IconButton'
import GenreTypeChip from '../../GenreTypeChip'
import useGenreNavigatorSettings from '../useGenreNavigatorSettings'
import RelevanceChip from './RelevanceChip'
import { useTreeState } from './state'
import { useGenreTreeRef } from './useGenreTreeRef'

const GenreTreeNode: FC<{ genre: TreeGenre; path: number[] }> = ({
  genre,
  path,
}) => {
  const { id, childGenres, parentGenres, name, subtitle, relevance } = genre

  const childrenQuery = useTreeGenreChildrenQuery(id)

  const setExpanded = useTreeState((state) => state.setExpanded)
  const isExpanded = useTreeState((state) => state.getExpanded(path))
  const isSelected = useTreeState(
    (state) => state.selectedPath && equals(state.selectedPath, path)
  )

  const { showTypeTags, showRelevanceTags } = useGenreNavigatorSettings()
  const setSelectedId = useTreeState((state) => state.setSelectedId)
  const setSelectedPath = useTreeState((state) => state.setSelectedPath)

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
          onClick={() => setExpanded(path, !isExpanded)}
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
            onClick={() => {
              setSelectedId(id)
              setSelectedPath(path)
            }}
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
      {isExpanded && childGenres.length > 0 && (
        <ul>
          {childrenQuery.data ? (
            childrenQuery.data.map((node) => {
              const p = [...path, node.id]
              return <GenreTreeNode key={p.join('-')} genre={node} path={p} />
            })
          ) : childrenQuery.error ? (
            <li className='ml-4 border-l pl-[34px] text-error-600'>
              Error fetching children
            </li>
          ) : (
            <li className='ml-4 border-l pl-[34px] text-gray-600'>
              Loading...
            </li>
          )}
        </ul>
      )}
    </li>
  )
}

export default GenreTreeNode
