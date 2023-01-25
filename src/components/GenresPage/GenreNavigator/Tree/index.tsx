import { Permission } from '@prisma/client'
import Link from 'next/link'
import { FC, useMemo, useState } from 'react'

import { TreeGenre } from '../../../../server/db/genre/outputs'
import { useSession } from '../../../../services/auth'
import { useTopLevelTreeGenresQuery } from '../../../../services/genres'
import Button from '../../../common/Button'
import { CenteredLoader } from '../../../common/Loader'
import GenreTreeNode from './TreeNode'
import { GenreTreeRefProvider } from './useGenreTreeRef'
import { useGenreTreeState } from './useGenreTreeState'

const GenreTree: FC = () => {
  const topLevelGenresQuery = useTopLevelTreeGenresQuery()

  if (topLevelGenresQuery.data) {
    return <Tree topLevelGenres={topLevelGenresQuery.data} />
  }

  if (topLevelGenresQuery.error) {
    return (
      <div className='flex h-full w-full items-center justify-center text-error-600'>
        Error fetching genres :(
      </div>
    )
  }

  return <CenteredLoader />
}

const Tree: FC<{ topLevelGenres: TreeGenre[] }> = ({ topLevelGenres }) => {
  const session = useSession()
  const [ref, setRef] = useState<HTMLDivElement | null>(null)

  const { expanded, collapseAll } = useGenreTreeState()

  const isAnyTopLevelExpanded = useMemo(
    () =>
      Object.entries(expanded).some(
        ([key, value]) => value === 'expanded' && !key.includes('-')
      ),
    [expanded]
  )

  return (
    <GenreTreeRefProvider treeEl={ref}>
      <div className='flex h-full w-full flex-col'>
        {topLevelGenres.length > 0 ? (
          <div ref={setRef} className='flex-1 overflow-auto p-4'>
            <ul>
              {topLevelGenres.map((genre) => (
                <GenreTreeNode key={genre.id} genre={genre} path={[genre.id]} />
              ))}
            </ul>
          </div>
        ) : (
          <div className='flex w-full flex-1 flex-col items-center justify-center text-gray-400'>
            <div>No genres found.</div>
            {session.isLoggedIn &&
              session.hasPermission(Permission.EDIT_GENRES) && (
                <div>
                  <Link
                    href={{ pathname: '/genres', query: { view: 'create' } }}
                  >
                    <a className='text-primary-500 hover:underline'>
                      Create one.
                    </a>
                  </Link>
                </div>
              )}
          </div>
        )}
        {isAnyTopLevelExpanded && (
          <Button template='tertiary' onClick={() => collapseAll()}>
            Collapse all
          </Button>
        )}
      </div>
    </GenreTreeRefProvider>
  )
}

export default GenreTree
