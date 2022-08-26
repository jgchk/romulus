import { Permission } from '@prisma/client'
import { FC } from 'react'

import { useSession } from '../../services/auth'
import { CenteredLoader } from '../common/Loader'
import { useGenrePageContext } from './context'
import GenreTreeNode from './GenreTreeNode'
import useGenreTreeQuery, { TreeNode } from './useGenreTreeQuery'

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

  const { setView } = useGenrePageContext()

  return (
    <div className='w-full h-full flex flex-col'>
      {tree.length > 0 ? (
        <div className='flex-1 overflow-auto p-4'>
          <ul>
            {tree.map((node) => (
              <GenreTreeNode key={node.key} node={node} />
            ))}
          </ul>
        </div>
      ) : (
        <div className='flex-1 w-full flex flex-col items-center justify-center text-gray-400'>
          <div>No genres found.</div>
          {session.isLoggedIn && session.hasPermission(Permission.EDIT_GENRES) && (
            <div>
              <button
                className='text-blue-500 hover:underline'
                onClick={() => setView({ type: 'create' })}
              >
                Create one.
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GenreTree
