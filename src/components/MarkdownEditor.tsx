import clsx from 'clsx'
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  useState,
} from 'react'
import ReactMarkdown from 'react-markdown'

enum Tab {
  EDIT,
  VIEW,
}

const MarkdownEditor = forwardRef<
  HTMLTextAreaElement,
  {
    id?: string
    value: string
    onChange: ChangeEventHandler<HTMLTextAreaElement>
    onBlur: FocusEventHandler<HTMLTextAreaElement>
    className?: string
  }
>(({ id, value, onChange, onBlur }, ref) => {
  const [tab, setTab] = useState<Tab>(Tab.EDIT)

  return (
    <div className='flex flex-col h-72 overflow-auto resize-y border rounded-sm focus-within:outline outline-2'>
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
        <div className='flex-1 overflow-auto prose prose-gray px-2 py-1'>
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      )}
      <div className='border-t border-gray-200 flex'>
        <button
          className={clsx(
            'border-r border-gray-200 px-2 py-1 uppercase text-xs text-gray-400 hover:bg-gray-100',
            tab === Tab.EDIT ? 'font-bold' : 'font-medium'
          )}
          type='button'
          onClick={() => setTab(Tab.EDIT)}
        >
          Edit
        </button>
        <button
          className={clsx(
            'border-r border-gray-200 px-2 py-1 uppercase text-xs text-gray-400 hover:bg-gray-100',
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

MarkdownEditor.displayName = 'MarkdownEditor'

export default MarkdownEditor
