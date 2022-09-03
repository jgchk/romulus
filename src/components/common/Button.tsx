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
        'flex h-8 items-center justify-center font-semibold text-sm py-1 px-3 rounded outline-none transition',
        (disabled || loading) && 'pointer-events-none',
        template === 'primary' &&
          (disabled
            ? 'bg-gray-300 text-gray-500 border border-transparent'
            : 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-gray-100 border border-transparent focus:border-secondary-500'),
        template === 'secondary' &&
          (disabled
            ? 'bg-transparent text-gray-400 border border-gray-400'
            : 'bg-transparent text-primary-500 hover:text-primary-600 active:text-primary-700 border border-primary-500 hover:border-primary-600 active:border-primary-700 focus:border-secondary-500'),
        template === 'tertiary' &&
          (disabled
            ? 'bg-transparent text-gray-400 border border-transparent'
            : 'bg-transparent hover:bg-gray-200 active:bg-gray-300 text-primary-500 border border-transparent focus:border-secondary-500'),
        template === 'danger' &&
          (disabled
            ? 'bg-gray-300 text-gray-500 border border-transparent'
            : 'bg-error-500 hover:bg-error-600 active:bg-error-700 text-gray-100 border border-transparent focus:border-error-800'),
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
