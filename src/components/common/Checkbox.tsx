import { FC } from 'react'

import { twsx } from '../../utils/dom'

// TODO: replace existing usages of checkbox with this one
const Checkbox: FC<{
  id?: string
  className?: string
  value?: boolean
  onChange?: (value: boolean) => void
  disabled?: boolean
}> = ({ id, className, value, onChange, disabled }) => (
  <input
    id={id}
    type='checkbox'
    className={twsx(
      'h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600',
      className
    )}
    checked={!!value}
    onChange={(e) => onChange?.(e.target.checked)}
    disabled={disabled}
  />
)

export default Checkbox
