import { PropsWithChildren } from 'react'
import { RiCloseFill } from 'react-icons/ri'

import { HasId, useMultiselectContext } from './context'

export type MultiselecteSelectedProps<T> = {
  item: T
}

const MultiselectSelected = <T extends HasId>({
  item,
  children,
}: PropsWithChildren<MultiselecteSelectedProps<T>>) => {
  const { unselect } = useMultiselectContext()

  return (
    <button
      type='button'
      className='group flex items-center space-x-1 overflow-hidden rounded-full border border-gray-400 bg-gray-200 py-0.5 pl-2 pr-1 text-xs font-medium text-gray-600 hover:border-error-700 hover:bg-error-300 hover:text-error-800'
      onClick={(e) => {
        unselect(item)
        e.stopPropagation()
      }}
    >
      <span>{children}</span>
      <RiCloseFill
        size={12}
        className='text-gray-500 group-hover:text-error-700'
      />
    </button>
  )
}

export default MultiselectSelected
