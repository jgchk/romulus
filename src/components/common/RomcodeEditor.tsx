import clsx from 'clsx'
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  useState,
} from 'react'

import { twsx } from '../../utils/dom'
import Romcode from './Romcode'

enum Tab {
  EDIT,
  VIEW,
}

const RomcodeEditor = forwardRef<
  HTMLTextAreaElement,
  {
    id?: string
    value: string
    onChange: ChangeEventHandler<HTMLTextAreaElement>
    onBlur: FocusEventHandler<HTMLTextAreaElement>
    className?: string
  }
>(({ id, value, onChange, onBlur, className }, ref) => {
  const [tab, setTab] = useState<Tab>(Tab.EDIT)

  return (
    <div
      className={twsx(
        'flex flex-col h-72 overflow-auto resize-y border rounded-sm focus-within:outline outline-2',
        className
      )}
    >
      {tab === Tab.EDIT && (
        <textarea
          ref={ref}
          id={id}
          className='flex-1 resize-none px-2 py-1 focus:outline-none'
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          style={{ flex: 1, resize: 'none' }}
        />
      )}
      {tab === Tab.VIEW && (
        <div className='flex-1 overflow-auto px-2 py-1'>
          <Romcode>{value}</Romcode>
        </div>
      )}
      <div className='flex border-t border-gray-200'>
        <button
          className={clsx(
            'border-r border-gray-200 px-2 py-1 text-xs uppercase text-gray-400 hover:bg-gray-100',
            tab === Tab.EDIT ? 'font-bold' : 'font-medium'
          )}
          type='button'
          onClick={() => setTab(Tab.EDIT)}
        >
          Edit
        </button>
        <button
          className={clsx(
            'border-r border-gray-200 px-2 py-1 text-xs uppercase text-gray-400 hover:bg-gray-100',
            tab === Tab.VIEW ? 'font-bold' : 'font-medium'
          )}
          type='button'
          onClick={() => setTab(Tab.VIEW)}
        >
          View
        </button>
      </div>
    </div>
  )
})

RomcodeEditor.displayName = 'RomcodeEditor'

export default RomcodeEditor
