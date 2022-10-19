import { FC } from 'react'
import { IoMdInformationCircle } from 'react-icons/io'

import InputGroup from '../../common/InputGroup'
import Label from '../../common/Label'
import Tooltip from '../../common/Tooltip'
import RelevanceSelect from '../RelevanceSelect'
import useGenreNavigatorSettings from './useGenreNavigatorSettings'

const GenreNavigatorSettings: FC = () => {
  const {
    showTypeTags,
    setShowTypeTags,
    genreRelevanceFilter,
    setGenreRelevanceFilter,
    showRelevanceTags,
    setShowRelevanceTags,
  } = useGenreNavigatorSettings()

  return (
    <div className='space-y-4'>
      <InputGroup
        id='relevance'
        label={
          <div className='flex items-center'>
            <span>Genre Relevance Filter</span> <GenreRelevanceHelpIcon />
          </div>
        }
      >
        <RelevanceSelect
          value={genreRelevanceFilter}
          onChange={(v) => setGenreRelevanceFilter(v)}
        />
      </InputGroup>

      <div className='flex items-center space-x-2'>
        <input
          id='show-type-tags'
          type='checkbox'
          className='h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600'
          checked={showTypeTags}
          onChange={(e) => setShowTypeTags(e.target.checked)}
        />
        <Label htmlFor='show-type-tags'>Show Genre Type Tags</Label>
      </div>

      <div className='flex items-center space-x-2'>
        <input
          id='show-relevance-tags'
          type='checkbox'
          className='h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600'
          checked={showRelevanceTags}
          onChange={(e) => setShowRelevanceTags(e.target.checked)}
        />
        <Label htmlFor='show-relevance-tags'>Show Genre Relevance Tags</Label>
      </div>
    </div>
  )
}

const GenreRelevanceHelpIcon: FC = () => (
  <Tooltip
    tip='Any genres with a relevance below this value will not be shown'
    className='p-1'
    delay={0}
  >
    <IoMdInformationCircle size={16} className='text-primary-500' />
  </Tooltip>
)

export default GenreNavigatorSettings
