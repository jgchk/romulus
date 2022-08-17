import { range } from 'ramda'
import { FC, useState } from 'react'
import { IoMdInformationCircle } from 'react-icons/io'

import {
  MAX_GENRE_RELEVANCE,
  MIN_GENRE_RELEVANCE,
} from '../../server/db/common/inputs'
import Popover from '../common/Popover'
import { getGenreRelevanceText } from './common'
import useGenreTreeSettings from './useGenreTreeSettings'

const GenreTreeSettings: FC = () => {
  const {
    showTypeTags,
    setShowTypeTags,
    genreRelevanceFilter,
    setGenreRelevanceFilter,
    showRelevanceTags,
    setShowRelevanceTags,
  } = useGenreTreeSettings()

  return (
    <div className='space-y-4'>
      <div>
        <label
          className='text-gray-700 text-sm flex items-center space-x-1'
          htmlFor='relevance'
        >
          <span>Genre Relevance Filter</span> <GenreRelevanceHelpIcon />
        </label>
        <select
          id='relevance'
          className='border rounded-sm p-1 px-2 mt-0.5 capitalize text-sm'
          value={genreRelevanceFilter}
          onChange={(e) =>
            setGenreRelevanceFilter(Number.parseInt(e.target.value))
          }
        >
          {range(MIN_GENRE_RELEVANCE, MAX_GENRE_RELEVANCE + 1).map((r) => (
            <option key={r} value={r}>
              {r} - {getGenreRelevanceText(r)}
            </option>
          ))}
        </select>
      </div>

      <div className='flex items-center space-x-2'>
        <input
          id='show-type-tags'
          type='checkbox'
          className='w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
          checked={showTypeTags}
          onChange={(e) => setShowTypeTags(e.target.checked)}
        />
        <label className='text-gray-700 text-sm' htmlFor='show-type-tags'>
          Show Genre Type Tags
        </label>
      </div>

      <div className='flex items-center space-x-2'>
        <input
          id='show-relevance-tags'
          type='checkbox'
          className='w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
          checked={showRelevanceTags}
          onChange={(e) => setShowRelevanceTags(e.target.checked)}
        />
        <label className='text-gray-700 text-sm' htmlFor='show-relevance-tags'>
          Show Genre Relevance Tags
        </label>
      </div>
    </div>
  )
}

const GenreRelevanceHelpIcon: FC = () => {
  const [el, setEl] = useState<HTMLDivElement | null>(null)

  return (
    <>
      <div ref={setEl} className='p-1'>
        <IoMdInformationCircle size={16} className='text-blue-500' />
      </div>

      <Popover referenceElement={el}>
        Any genres with a relevance below this value will not be shown
      </Popover>
    </>
  )
}

export default GenreTreeSettings
