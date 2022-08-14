import { FC } from 'react'

import { useGenreTreeSettings } from './common'

const GenreTreeSettings: FC = () => {
  const {
    showTypeTags,
    setShowTypeTags,
    genreRelevanceFilter,
    setGenreRelevanceFilter,
  } = useGenreTreeSettings()

  return (
    <div>
      <div className='flex items-center space-x-2'>
        <input
          id='show-type-tags'
          type='checkbox'
          checked={showTypeTags}
          onChange={(e) => setShowTypeTags(e.target.checked)}
        />
        <label className='text-gray-700 text-sm' htmlFor='show-type-tags'>
          Show Genre Type Tags
        </label>
      </div>

      <div className='flex items-center space-x-2'>
        <select
          id='relevance'
          className='border rounded-sm p-1 px-2 mt-0.5 capitalize'
          value={genreRelevanceFilter}
          onChange={(e) =>
            setGenreRelevanceFilter(Number.parseInt(e.target.value))
          }
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
        <label className='text-gray-700 text-sm' htmlFor='relevance'>
          Genre Relevance Filter
        </label>
      </div>
    </div>
  )
}

export default GenreTreeSettings
