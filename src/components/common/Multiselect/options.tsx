import { FC, PropsWithChildren } from 'react'

import { CenteredLoader } from '../Loader'
import { useMultiselectContext } from './context'

const MultiselectOptions: FC<PropsWithChildren> = ({ children }) => {
  const { open, options } = useMultiselectContext()

  if (!open) return null

  return (
    <ul
      className='max-h-64 w-full overflow-auto p-1 outline-none'
      style={{ top: 'calc(100% - 1px)' }}
    >
      {options ? (
        options.length > 0 ? (
          children
        ) : (
          <div className='px-2 py-1 text-sm text-gray-700'>
            No results found
          </div>
        )
      ) : (
        <CenteredLoader className='m-2' />
      )}
    </ul>
  )
}

export default MultiselectOptions
