import { FC, InputHTMLAttributes, useMemo } from 'react'
import { RiCloseFill } from 'react-icons/ri'

import { twsx } from '../../utils/dom'
import Tooltip from './Tooltip'

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value'
> & {
  value?: string
  showClear?: boolean
}

const Input: FC<InputProps> = ({
  className,
  showClear = false,
  value,
  ...props
}) => {
  const isClearVisible = useMemo(
    () => !!(showClear && value?.length),
    [showClear, value?.length]
  )

  return (
    <div className='relative'>
      <input
        value={value}
        className={twsx(
          'w-full rounded border border-gray-500 bg-gray-100 p-1.5 text-sm leading-3 text-gray-800 placeholder:italic placeholder:text-gray-700 hover:bg-gray-200 active:bg-gray-300 focus:border-secondary-500 outline-none transition disabled:border-dashed disabled:pointer-events-none',
          isClearVisible && 'pr-7',
          className
        )}
        {...props}
      />
      {isClearVisible && (
        <div className='absolute top-0 right-1 flex h-full items-center'>
          <Tooltip tip='Clear'>
            <button className='rounded-full p-1 text-gray-500 transition hover:bg-gray-200 hover:text-gray-600'>
              <RiCloseFill />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}

export default Input
