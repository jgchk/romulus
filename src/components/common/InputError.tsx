import { FC, PropsWithChildren } from 'react'

import { twsx } from '../../utils/dom'

const InputError: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => (
  <div className={twsx('text-xs text-error-500 italic', className)}>
    {children}
  </div>
)

export default InputError
