import { useEffect } from 'react'
import { FC, PropsWithChildren, useState } from 'react'

import { CenteredLoader } from '../Loader'
import Popover from '../Popover'
import { useMultiselectContext } from './context'

const MultiselectOptions: FC<PropsWithChildren> = ({ children }) => {
  const { options, setOpen } = useMultiselectContext()

  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      const target = e.target

      if (!ref) return
      if (!(target instanceof Node)) return

      if (
        !ref.contains(target) &&
        !(
          target instanceof HTMLElement &&
          target.classList.contains('select-option')
        )
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('click', listener)
    return () => {
      document.removeEventListener('click', listener)
    }
  }, [ref, setOpen])

  return (
    <Popover.Content className='w-full'>
      <ul
        className='max-h-64 w-full overflow-auto rounded border border-gray-500 bg-gray-100 p-1 shadow outline-none'
        ref={setRef}
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
    </Popover.Content>
  )
}

export default MultiselectOptions
