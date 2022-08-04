import type { NextPage } from 'next'
import { FC, useState } from 'react'
import CreateGenreDialog from '../../components/CreateGenreDialog'
import GenreTree from '../../components/GenreTree'
import { useSession } from '../../services/auth'
import { useGenresQuery } from '../../services/genres'

const Content: FC = () => {
  const genresQuery = useGenresQuery()

  if (genresQuery.data) {
    return <GenreTree genres={genresQuery.data} />
  }

  if (genresQuery.error) {
    return <div>Error while fetching genres :(</div>
  }

  return <div>Loading...</div>
}

const Genres: NextPage = () => {
  const [showCreateGenreDialog, setShowCreateGenreDialog] = useState(false)

  const session = useSession()

  return (
    <>
      <div>
        {session.isLoggedIn && (
          <button
            className='bg-blue-600 rounded-sm text-white font-bold p-1 px-4'
            onClick={() => setShowCreateGenreDialog(true)}
          >
            Add Genre
          </button>
        )}
        <Content />
      </div>

      {showCreateGenreDialog && (
        <CreateGenreDialog onClose={() => setShowCreateGenreDialog(false)} />
      )}
    </>
  )
}

export default Genres
