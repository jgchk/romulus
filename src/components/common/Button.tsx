import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react'

import { twsx } from '../../utils/dom'
import Loader from './Loader'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  template?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  loading?: boolean
}

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  template = 'primary',
  children,
  className,
  loading,
  disabled,
  ...props
}) => {
  return (
    <button
      className={twsx(
        'flex items-center justify-center font-semibold text-sm py-1 px-3 rounded',
        (disabled || loading) && 'pointer-events-none',
        template === 'primary' &&
          (disabled
            ? 'bg-neutral-300 text-neutral-500 border border-transparent'
            : 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-neutral-100 border border-transparent focus:border-secondary-500'),
        template === 'secondary' &&
          (disabled
            ? 'bg-transparent text-neutral-400 border border-neutral-400'
            : 'bg-transparent text-primary-500 hover:text-primary-600 active:text-primary-700 border border-primary-500 hover:border-primary-600 active:border-primary-700 focus:border-secondary-500'),
        template === 'tertiary' &&
          (disabled
            ? 'bg-transparent text-neutral-400 border border-transparent'
            : 'bg-transparent hover:bg-neutral-200 active:bg-neutral-300 text-primary-500 border border-transparent focus:border-secondary-500'),
        template === 'danger' &&
          (disabled
            ? 'bg-neutral-300 text-neutral-500 border border-transparent'
            : 'bg-error-500 hover:bg-error-600 active:bg-error-700 text-neutral-100 border border-transparent focus:border-error-800'),
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader className='text-inherit mr-1.5' size={14} />}
      {children}
    </button>
  )
}

export default Button
