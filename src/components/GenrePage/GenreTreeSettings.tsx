import { FC } from 'react'

import { useGenreTreeSettings } from './common'

const GenreTreeSettings: FC = () => {
  const { showTypeTags, setShowTypeTags } = useGenreTreeSettings()

  return (
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
  )
}

export default GenreTreeSettings
