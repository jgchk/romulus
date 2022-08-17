import clsx from 'clsx'
import { FC } from 'react'

import useRomcode from './useRomcode'

const Romcode: FC<{ children: string; className?: string }> = ({
  children,
  className,
}) => {
  const reactNode = useRomcode(children)
  return <div className={clsx('prose prose-gray', className)}>{reactNode}</div>
}

export default Romcode
