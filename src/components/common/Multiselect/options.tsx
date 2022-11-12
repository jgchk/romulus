import { FC, PropsWithChildren, useEffect, useState } from 'react'

import { CenteredLoader } from '../Loader'
import Popover from '../Popover'
import { useMultiselectContext } from './context'

const MultiselectOptions: FC<PropsWithChildren> = ({ children }) => {
  const { options, setOpen } = useMultiselectContext()

  // close options menu when user clicks outside
  const [ref, setRef] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!ref) return

    const handler = (e: MouseEvent) => {
      if (!e.target || !(e.target instanceof Element)) return

      if (
        !ref.contains(e.target) &&
        !e.target.classList.contains('multiselect-option')
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('click', handler)
    return () => {
      document.removeEventListener('click', handler)
    }
  }, [ref, setOpen])

  return (
    <Popover.Content className='w-full' ref={setRef}>
      <ul className='max-h-64 w-full overflow-auto rounded border border-gray-500 bg-gray-100 p-1 shadow outline-none'>
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
