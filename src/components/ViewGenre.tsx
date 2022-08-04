import { FC } from 'react'
import { DefaultGenre } from '../server/db/genre'
import { useGenreQuery } from '../services/genres'

const ViewGenre: FC<{
  genre: DefaultGenre
  onClickGenre: (id: number) => void
}> = ({ genre }) => {
  return (
    <div>
      <div className='text-lg font-bold text-gray-600 mb-4'>{genre.name}</div>
      <div className='space-y-3'>
        <div>
          <label
            className='block text-gray-700 text-sm'
            htmlFor='short-description'
          >
            Short Description
          </label>
          <div id='short-description'>{genre.shortDescription}</div>
        </div>

        <div>
          <label
            className='block text-gray-700 text-sm'
            htmlFor='long-description'
          >
            Long Description
          </label>
          <div id='long-description'>{genre.longDescription}</div>
        </div>
      </div>
    </div>
  )
}

const Wrapper: FC<{ id: number; onClickGenre: (id: number) => void }> = ({
  id,
  onClickGenre,
}) => {
  const genreQuery = useGenreQuery(id)

  if (genreQuery.data) {
    return <ViewGenre genre={genreQuery.data} onClickGenre={onClickGenre} />
  }

  if (genreQuery.error) {
    return <div>Error fetching genre :(</div>
  }

  return <div>Loading...</div>
}

export default Wrapper
