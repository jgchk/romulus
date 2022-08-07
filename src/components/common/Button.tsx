import clsx from 'clsx'
import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

const commonStyles = 'border-2 font-bold rounded-sm p-1 px-4'

export const ButtonPrimary: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={clsx(
      'border-transparent bg-blue-600 text-white',
      'hover:bg-blue-700',
      commonStyles,
      className
    )}
    {...props}
  >
    {children}
  </button>
)

export const ButtonPrimaryRed: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={clsx(
      'border-transparent bg-red-600 text-white',
      'hover:bg-red-700',
      commonStyles,
      className
    )}
    {...props}
  >
    {children}
  </button>
)

export const ButtonSecondary: FC<ButtonProps> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={clsx(
      'border-blue-600 text-blue-600',
      'hover:bg-blue-200 hover:text-blue-700',
      commonStyles,
      className
    )}
    {...props}
  >
    {children}
  </button>
)

export const ButtonTertiary: FC<ButtonProps> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={clsx(
      'border-transparent text-gray-600',
      'hover:bg-gray-200 hover:text-gray-700',
      commonStyles,
      className
    )}
    {...props}
  >
    {children}
  </button>
)
