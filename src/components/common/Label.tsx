import { FC, LabelHTMLAttributes } from 'react'

import { twsx } from '../../utils/dom'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  error?: unknown
}

const Label: FC<LabelProps> = ({ children, error, className, ...props }) => (
  <label
    className={twsx(
      'block text-sm',
      error ? 'text-error-600' : 'text-gray-700',
      className
    )}
    {...props}
  >
    {children}
  </label>
)

export default Label
