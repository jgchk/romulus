import { FC, useState } from 'react'
import { IoMdInformationCircle } from 'react-icons/io'

import Popover from '../common/Popover'
import { useGenreTreeSettings } from './common'

const GenreTreeSettings: FC = () => {
  const {
    showTypeTags,
    setShowTypeTags,
    genreRelevanceFilter,
    setGenreRelevanceFilter,
  } = useGenreTreeSettings()

  return (
    <table className='border-separate border-spacing-x-1 border-spacing-y-2'>
      <tbody>
        <tr>
          <td align='right'>
            <select
              id='relevance'
              className='border rounded-sm p-1 px-2 mt-0.5 capitalize text-sm'
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
          </td>
          <td>
            <label
              className='text-gray-700 text-sm flex items-center space-x-1'
              htmlFor='relevance'
            >
              <span>Genre Relevance Filter</span> <GenreRelevanceHelpIcon />
            </label>
          </td>
        </tr>

        <tr>
          <td align='right'>
            <input
              id='show-type-tags'
              type='checkbox'
              className='w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
              checked={showTypeTags}
              onChange={(e) => setShowTypeTags(e.target.checked)}
            />
          </td>
          <td>
            <label className='text-gray-700 text-sm' htmlFor='show-type-tags'>
              Show Genre Type Tags
            </label>
          </td>
        </tr>
      </tbody>
    </table>
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
