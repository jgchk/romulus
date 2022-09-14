import { Listbox } from '@headlessui/react'
import {
  ForwardedRef,
  Fragment,
  ReactElement,
  ReactNode,
  useImperativeHandle,
  useRef,
} from 'react'
import { forwardRef } from 'react'
import { useMemo } from 'react'
import { useEffect } from 'react'
import { Key } from 'react'
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiErrorWarningLine,
} from 'react-icons/ri'

import { twsx } from '../../utils/dom'
import { useInputGroupContext } from './InputGroup'

export type Option = ({ id: Key; key?: Key } | { key: Key; id?: Key }) & {
  label: ReactNode
  disabled?: boolean
}

type SelectProps<T> = {
  value?: T
  options: T[]
  onChange: (value: T) => void
  placeholder?: string
  id?: string
  error?: unknown
}

const Select = <T extends Option>(
  {
    value,
    options,
    onChange,
    placeholder,
    id: propsId,
    error: propsError,
  }: SelectProps<T>,
  ref: ForwardedRef<HTMLButtonElement>
) => {
  const { id: contextId, error: contextError } = useInputGroupContext()
  const id = useMemo(() => propsId || contextId, [contextId, propsId])
  const error = useMemo(
    () => propsError || contextError,
    [contextError, propsError]
  )

  // HeadlessUI overwrites our ids. Re-overwrite them here.
  const internalRef = useRef<HTMLButtonElement>(null)
  useImperativeHandle<HTMLButtonElement | null, HTMLButtonElement | null>(
    ref,
    () => internalRef.current
  )
  useEffect(() => {
    if (internalRef.current && id !== undefined) {
      internalRef.current.id = id
    }
  }, [id])

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <>
          <Listbox.Button
            id={id}
            ref={internalRef}
            className={twsx(
              'h-8 flex w-full items-center rounded border border-gray-500 bg-gray-100 p-1.5 text-start text-sm text-gray-800 outline-none transition hover:bg-gray-200 focus:border-secondary-500 active:bg-gray-300 disabled:pointer-events-none disabled:border-dashed',
              value === undefined && 'italic text-gray-700'
            )}
          >
            <>
              <span className='overflow-hidden text-ellipsis'>
                {value?.label ?? placeholder}
              </span>
              <div className='flex-1' />
              {error && (
                <RiErrorWarningLine
                  className='ml-1 shrink-0 text-error-500'
                  size={18}
                />
              )}
              {(open ? RiArrowUpSLine : RiArrowDownSLine)({
                size: 18,
                className: 'ml-1 shrink-0 text-primary-500',
              })}
            </>
          </Listbox.Button>
          {open && (
            <Listbox.Options static className='rounded p-1 outline-none'>
              {options.map((option, i) => (
                <Listbox.Option
                  key={option.key ?? option.id ?? i}
                  value={option}
                  as={Fragment}
                >
                  {({ active, selected }) => (
                    <li
                      className={twsx(
                        'cursor-pointer rounded p-1 text-sm text-gray-800 hover:bg-gray-200 focus:border-secondary-500 active:bg-gray-300 border border-transparent',
                        selected && 'border-primary-500',
                        active && 'border-secondary-500'
                      )}
                    >
                      {option.label}
                    </li>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          )}
        </>
      )}
    </Listbox>
  )
}

const Wrapper = forwardRef(Select) as <T extends Option>(
  props: SelectProps<T> & { ref?: ForwardedRef<HTMLButtonElement> }
) => ReactElement

export default Wrapper
