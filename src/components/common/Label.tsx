import clsx from 'clsx'
import { FC, LabelHTMLAttributes } from 'react'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  error?: unknown
  display?: string
}

const Label: FC<LabelProps> = ({
  children,
  error,
  className,
  display,
  ...props
}) => (
  <label
    className={clsx(
      display ?? 'block',
      'text-sm',
      error ? 'text-red-600' : 'text-gray-700',
      className
    )}
    {...props}
  >
    {children}
  </label>
)

export default Label
