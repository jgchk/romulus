import { FC } from 'react'

import { twsx } from '../../../utils/dom'
import useRomcode from './useRomcode'

const Romcode: FC<{ children: string; className?: string }> = ({
  children,
  className,
}) => {
  const reactNode = useRomcode(children)
  return <div className={twsx('prose prose-gray', className)}>{reactNode}</div>
}

export default Romcode
