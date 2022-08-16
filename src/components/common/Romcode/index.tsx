import { FC } from 'react'

import useRomcode from './useRomcode'

const Romcode: FC<{ children: string }> = ({ children }) => {
  const reactNode = useRomcode(children)
  return <div className='prose prose-gray'>{reactNode}</div>
}

export default Romcode
