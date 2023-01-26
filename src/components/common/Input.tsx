import { forwardRef, InputHTMLAttributes, useMemo } from 'react'
import { RiCloseFill, RiErrorWarningLine } from 'react-icons/ri'

import { twsx } from '../../utils/dom'
import { useInputGroupContext } from './InputGroup'
import Tooltip from './Tooltip'

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  error?: unknown
  value?: string
  onChange?: (value: string) => void
  showClear?: boolean
  onClear?: () => void
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id: propsId,
      className,
      showClear = false,
      value,
      onChange,
      onClear,
      error: propsError,
      ...props
    },
    ref
  ) => {
    const { id: contextId, error: contextError } = useInputGroupContext()
    const id = useMemo(() => propsId || contextId, [contextId, propsId])
    const error = useMemo(
      () => propsError || contextError,
      [contextError, propsError]
    )

    const isClearVisible = useMemo(
      () => !!(showClear && value?.length),
      [showClear, value?.length]
    )

    return (
      <div className={twsx('relative', className)}>
        <>
          <input
            ref={ref}
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className={twsx(
              'w-full h-8 rounded border border-gray-500 bg-gray-100 p-1.5 text-sm leading-3 text-gray-800 placeholder:italic placeholder:text-gray-700 hover:bg-gray-200 active:bg-gray-300 focus:border-secondary-500 outline-none transition disabled:border-dashed disabled:pointer-events-none',
              isClearVisible && 'pr-7'
            )}
            {...props}
          />

          {(isClearVisible || error) && (
            <div className='absolute top-0 right-1.5 flex h-full items-center space-x-0.5'>
              <>
                {isClearVisible && (
                  <Tooltip tip='Clear' className='flex items-center'>
                    <button
                      className='rounded-full p-1 text-gray-500 transition hover:bg-gray-300 hover:text-gray-600'
                      onClick={() => {
                        onChange?.('')
                        onClear?.()
                      }}
                    >
                      <RiCloseFill />
                    </button>
                  </Tooltip>
                )}
                {error && (
                  <RiErrorWarningLine className='text-error-500' size={18} />
                )}
              </>
            </div>
          )}
        </>
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
