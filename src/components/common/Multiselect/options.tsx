import { FC, PropsWithChildren } from 'react'

import { useMultiselectContext } from './context'

const MultiselectOptions: FC<PropsWithChildren> = ({ children }) => {
  const { open } = useMultiselectContext()

  if (!open) return null

  return (
    <ul
      className='max-h-64 w-full overflow-auto p-1 outline-none'
      style={{ top: 'calc(100% - 1px)' }}
    >
      {children}
    </ul>
  )
}

export default MultiselectOptions
