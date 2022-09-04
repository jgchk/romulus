import { useMemo } from 'react'
import { FC, PropsWithChildren } from 'react'
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri'

import { useMultiselectContext } from './context'

const MultiselectBox: FC<PropsWithChildren> = ({ children }) => {
  const { open, setOpen, inputRef } = useMultiselectContext()

  const icon = useMemo(() => (open ? RiArrowUpSLine : RiArrowDownSLine), [open])

  return (
    <div
      className='flex h-8 w-full items-center rounded border border-gray-500 bg-gray-100 text-start text-sm text-gray-800 outline-none transition focus-within:border-secondary-500 hover:bg-gray-200 active:bg-gray-300 disabled:pointer-events-none disabled:border-dashed'
      onClick={() => {
        setOpen(!open)
        inputRef?.focus()
      }}
    >
      <div className='flex flex-1 items-center space-x-1 p-1.5 pr-0'>
        {children}
      </div>
      <div className='flex h-full shrink-0 cursor-pointer items-center p-1.5 text-primary-500'>
        {icon({ size: 18 })}
      </div>
    </div>
  )
}

export default MultiselectBox
