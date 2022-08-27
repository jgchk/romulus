import { Permission } from '@prisma/client'
import Link from 'next/link'
import { FC, useState } from 'react'

import { useSession } from '../../../../services/auth'
import { CenteredLoader } from '../../../common/Loader'
import GenreTreeNode from './TreeNode'
import useGenreTreeQuery, { TreeNode } from './useGenreTreeQuery'
import { GenreTreeRefProvider } from './useGenreTreeRef'

const GenreTree: FC = () => {
  const treeQuery = useGenreTreeQuery()

  if (treeQuery.data) {
    return <Tree tree={treeQuery.data} />
  }

  if (treeQuery.error) {
    return (
      <div className='w-full h-full flex items-center justify-center text-red-600'>
        Error fetching genres :(
      </div>
    )
  }

  return <CenteredLoader />
}

const Tree: FC<{ tree: TreeNode[] }> = ({ tree }) => {
  const session = useSession()
  const [ref, setRef] = useState<HTMLDivElement | null>(null)

  return (
    <GenreTreeRefProvider treeEl={ref}>
      <div className='w-full h-full flex flex-col'>
        {tree.length > 0 ? (
          <div ref={setRef} className='flex-1 overflow-auto p-4'>
            <ul>
              {tree.map((node) => (
                <GenreTreeNode key={node.key} node={node} />
              ))}
            </ul>
          </div>
        ) : (
          <div className='flex-1 w-full flex flex-col items-center justify-center text-gray-400'>
            <div>No genres found.</div>
            {session.isLoggedIn &&
              session.hasPermission(Permission.EDIT_GENRES) && (
                <div>
                  <Link
                    href={{ pathname: '/genres', query: { view: 'create' } }}
                  >
                    <a>
                      <button className='text-blue-500 hover:underline'>
                        Create one.
                      </button>
                    </a>
                  </Link>
                </div>
              )}
          </div>
        )}
      </div>
    </GenreTreeRefProvider>
  )
}

export default GenreTree
