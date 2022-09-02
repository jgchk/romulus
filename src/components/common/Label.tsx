import { FC, LabelHTMLAttributes } from 'react'

import { twsx } from '../../utils/dom'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

const Label: FC<LabelProps> = ({ children, className, ...props }) => (
  <label
    className={twsx('block text-sm font-semibold text-gray-700', className)}
    {...props}
  >
    {children}
  </label>
)

export default Label
