import Romcode from '..'
import { twsx } from '../../../../utils/dom'
import { makeGenreTag } from '../../../../utils/genres'
import IconButton from '../../IconButton'
import Tooltip from '../../Tooltip'
import GenreSearchDialog from './GenreSearchDialog'
import clsx from 'clsx'
import {
  FocusEventHandler,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { RiBold, RiItalic, RiLink } from 'react-icons/ri'

enum Tab {
  EDIT,
  VIEW,
}

const RomcodeEditor = forwardRef<
  HTMLTextAreaElement,
  {
    id?: string
    value: string
    onChange: (value: string) => void
    onBlur: FocusEventHandler<HTMLTextAreaElement>
    className?: string
  }
>(({ id, value, onChange, onBlur, className }, ref) => {
  const [tab, setTab] = useState<Tab>(Tab.EDIT)
  const [showGenreDialog, setShowGenreDialog] = useState<boolean | string>(
    false,
  )

  const internalRef = useRef<HTMLTextAreaElement>(null)
  useImperativeHandle<HTMLTextAreaElement | null, HTMLTextAreaElement | null>(
    ref,
    () => internalRef.current,
  )

  const handleInsertGenreTag = useCallback(
    (id: number) => {
      const ta = internalRef.current
      const genreTag = makeGenreTag(id)
      if (ta && (ta.selectionStart || ta.selectionStart === 0)) {
        const startPos = ta.selectionStart
        const endPos = ta.selectionEnd

        const updatedValue =
          value.slice(0, startPos) + genreTag + value.slice(endPos)

        ta.value = updatedValue
        ta.focus()
        ta.selectionStart = startPos + genreTag.length
        ta.selectionEnd = startPos + genreTag.length

        onChange(updatedValue)
      } else {
        onChange(value + genreTag)
      }
    },
    [onChange, value],
  )

  const handleBold = useCallback(() => {
    const ta = internalRef.current
    if (!ta) return

    const startPos = ta.selectionStart
    const endPos = ta.selectionEnd

    const updatedValue =
      value.slice(0, startPos) +
      '**' +
      value.slice(startPos, endPos) +
      '**' +
      value.slice(endPos)

    ta.value = updatedValue
    ta.focus()
    ta.selectionStart = endPos + 4
    ta.selectionEnd = endPos + 4

    onChange(updatedValue)
  }, [onChange, value])

  const handleItalic = useCallback(() => {
    const ta = internalRef.current
    if (!ta) return

    const startPos = ta.selectionStart
    const endPos = ta.selectionEnd

    const updatedValue =
      value.slice(0, startPos) +
      '*' +
      value.slice(startPos, endPos) +
      '*' +
      value.slice(endPos)

    ta.value = updatedValue
    ta.focus()
    ta.selectionStart = endPos + 2
    ta.selectionEnd = endPos + 2

    onChange(updatedValue)
  }, [onChange, value])

  return (
    <>
      <div
        className={twsx(
          'flex h-72 resize-y flex-col overflow-auto rounded border border-gray-500 bg-gray-200 text-sm text-gray-800 transition focus-within:border-secondary-500 dark:bg-gray-800 dark:text-gray-200',
          className,
        )}
      >
        {tab === Tab.EDIT && (
          <div className='flex flex-1 flex-col'>
            <div className='flex border-b border-gray-300 bg-gray-100 transition dark:border-gray-700 dark:bg-gray-900'>
              <Tooltip tip='Bold'>
                <IconButton type='button' onClick={() => handleBold()}>
                  <RiBold />
                </IconButton>
              </Tooltip>
              <Tooltip tip='Italic'>
                <IconButton type='button' onClick={() => handleItalic()}>
                  <RiItalic />
                </IconButton>
              </Tooltip>
              <Tooltip tip='Insert genre link'>
                <IconButton
                  type='button'
                  onClick={() => {
                    const ta = internalRef.current
                    if (!ta) {
                      return setShowGenreDialog(true)
                    }

                    const startPos = ta.selectionStart
                    const endPos = ta.selectionEnd
                    const selectedText = value.slice(startPos, endPos)
                    setShowGenreDialog(selectedText || true)
                  }}
                >
                  <RiLink />
                </IconButton>
              </Tooltip>
            </div>

            <textarea
              ref={internalRef}
              id={id}
              className='flex-1 resize-none bg-transparent p-1.5 transition hover:bg-gray-300 focus:outline-none active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600'
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              style={{ flex: 1, resize: 'none' }}
            />
          </div>
        )}
        {tab === Tab.VIEW && (
          <div className='flex-1 overflow-auto px-2 py-1'>
            <Romcode>{value}</Romcode>
          </div>
        )}

        <div className='flex border-t border-gray-300 bg-gray-100 transition dark:border-gray-700 dark:bg-gray-900'>
          <button
            className={clsx(
              'border-r border-gray-200 px-2 py-1 text-xs uppercase text-gray-400 transition hover:bg-gray-200 active:bg-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700',
              tab === Tab.EDIT ? 'font-bold' : 'font-medium',
            )}
            type='button'
            onClick={() => setTab(Tab.EDIT)}
          >
            Edit
          </button>
          <button
            className={clsx(
              'border-r border-gray-200 px-2 py-1 text-xs uppercase text-gray-400 transition hover:bg-gray-200 active:bg-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700',
              tab === Tab.VIEW ? 'font-bold' : 'font-medium',
            )}
            type='button'
            onClick={() => setTab(Tab.VIEW)}
          >
            View
          </button>
        </div>
      </div>

      {showGenreDialog && (
        <GenreSearchDialog
          initialFilter={
            typeof showGenreDialog === 'string' && showGenreDialog.length > 0
              ? showGenreDialog
              : undefined
          }
          onClickOutside={() => setShowGenreDialog(false)}
          onClickClose={() => setShowGenreDialog(false)}
          onSelect={(match) => {
            handleInsertGenreTag(match.id)
            setShowGenreDialog(false)
          }}
        />
      )}
    </>
  )
})

RomcodeEditor.displayName = 'RomcodeEditor'

export default RomcodeEditor
