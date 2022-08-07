import { useRouter } from 'next/router'
import { FC } from 'react'

import { DefaultGenre } from '../../server/db/genre'
import { useSession } from '../../services/auth'
import { useGenreQuery } from '../../services/genres'
import { ButtonPrimary, ButtonTertiary } from '../common/Button'
import GenreViewData from './GenreViewData'

export const GenreView: FC<{
  id: number
}> = ({ id }) => {
  const genreQuery = useGenreQuery(id)

  if (genreQuery.data) {
    return <HasData genre={genreQuery.data} />
  }

  if (genreQuery.error) {
    return <div>Error fetching genre :(</div>
  }

  return <div>Loading...</div>
}

const HasData: FC<{ genre: DefaultGenre }> = ({ genre }) => {
  const session = useSession()
  const router = useRouter()

  return (
    <div className='flex flex-col h-full'>
      <GenreViewData genre={genre} />

      {session.isLoggedIn && (
        <div className='flex p-1 space-x-1 border-t'>
          <ButtonPrimary
            className='flex-1'
            onClick={() => router.push(`/genres/${genre.id}/edit`)}
          >
            Edit
          </ButtonPrimary>
          <ButtonTertiary
            className='flex-1'
            onClick={() => router.push(`/genres/${genre.id}/delete`)}
          >
            Delete
          </ButtonTertiary>
        </div>
      )}
    </div>
  )
}

export default GenreView
