import { PropsWithChildren, useCallback } from 'react'

import { HasId, useMultiselectContext } from './context'

export type MultiselectOptionProps<T> = {
  item: T
}

const MultiselectOption = <T extends HasId>({
  children,
  item,
}: PropsWithChildren<MultiselectOptionProps<T>>) => {
  const { select, onQueryChange } = useMultiselectContext()

  const handleClick = useCallback(() => {
    select(item)
    onQueryChange('')
  }, [item, onQueryChange, select])

  return (
    <li
      className='cursor-pointer rounded border border-transparent p-1 text-sm text-gray-800 hover:bg-gray-200 focus:border-secondary-500 active:bg-gray-300'
      onClick={() => handleClick()}
    >
      {children}
    </li>
  )
}

export default MultiselectOption
