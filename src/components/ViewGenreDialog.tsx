import { FC, useCallback } from 'react'
import { useGenreQuery } from '../services/genres'
import Dialog from './Dialog'

const ViewGenreDialog: FC<{
  id: number
  onClose: () => void
  onClickGenre: (id: number) => void
}> = ({ id, onClose, onClickGenre }) => {
  const genreQuery = useGenreQuery(id)

  const renderContent = useCallback(() => {
    if (genreQuery.data) {
      const genre = genreQuery.data
      return (
        <>
          <div className='text-lg font-bold text-gray-600 mb-4'>
            {genre.name}
          </div>
          <div className='space-y-3'>
            <div>
              <label
                className='block text-gray-700 text-sm'
                htmlFor='description'
              >
                Description
              </label>
              <div>{genre.description}</div>
            </div>

            <div>
              <label className='block text-gray-700 text-sm'>
                Parent Genres
              </label>
              <div>
                {genre.parentGenres.length > 0 ? (
                  <ul>
                    {genre.parentGenres.map((genre) => (
                      <li key={genre.id}>
                        <button onClick={() => onClickGenre(genre.id)}>
                          {genre.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  'No parent genres'
                )}
              </div>
            </div>

            <div>
              <label className='block text-gray-700 text-sm'>
                Child Genres
              </label>
              <div>
                {genre.childGenres.length > 0 ? (
                  <ul>
                    {genre.childGenres.map((genre) => (
                      <li key={genre.id}>
                        <button onClick={() => onClickGenre(genre.id)}>
                          {genre.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  'No child genres'
                )}
              </div>
            </div>
          </div>
        </>
      )
    }

    if (genreQuery.error) {
      return <div>Error loading genre</div>
    }

    return <div>Loading...</div>
  }, [genreQuery.data, genreQuery.error, onClickGenre])

  return (
    <Dialog>
      <div className='border p-4 shadow bg-white'>
        {renderContent()}
        <div className='flex space-x-1'>
          <button
            className='flex-1 bg-blue-600 rounded-sm text-white font-bold p-1 mt-4'
            type='button'
            onClick={() => onClose()}
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  )
}

export default ViewGenreDialog
