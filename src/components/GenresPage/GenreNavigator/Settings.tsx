import { range } from 'ramda'
import { FC, useMemo, useState } from 'react'
import { IoMdInformationCircle } from 'react-icons/io'

import {
  MAX_GENRE_RELEVANCE,
  MIN_GENRE_RELEVANCE,
} from '../../../server/db/common/inputs'
import Label from '../../common/Label'
import Popover from '../../common/Popover'
import Select from '../../common/Select'
import { getGenreRelevanceText } from '../utils'
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

  const relevanceOptions = useMemo(
    () =>
      range(MIN_GENRE_RELEVANCE, MAX_GENRE_RELEVANCE + 1).map((r) => ({
        key: r,
        label: `${r} - ${getGenreRelevanceText(r)}`,
      })),
    []
  )
  const selectedRelevanceOption = useMemo(
    () => relevanceOptions.find((ro) => ro.key === genreRelevanceFilter),
    [genreRelevanceFilter, relevanceOptions]
  )

  return (
    <div className='space-y-4'>
      <div>
        <Label htmlFor='relevance' className='flex items-center'>
          <span>Genre Relevance Filter</span> <GenreRelevanceHelpIcon />
        </Label>
        <Select
          id='relevance'
          value={selectedRelevanceOption}
          options={relevanceOptions}
          onChange={(v) => setGenreRelevanceFilter(v.key)}
        />
      </div>

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

const GenreRelevanceHelpIcon: FC = () => {
  const [el, setEl] = useState<HTMLDivElement | null>(null)

  return (
    <>
      <div ref={setEl} className='p-1'>
        <IoMdInformationCircle size={16} className='text-primary-500' />
      </div>

      <Popover referenceElement={el}>
        Any genres with a relevance below this value will not be shown
      </Popover>
    </>
  )
}

export default GenreNavigatorSettings
