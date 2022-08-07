import clsx from 'clsx'
import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export const ButtonPrimary: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={clsx(
      'border-2 border-transparent bg-blue-600 font-bold text-white rounded-sm p-1 px-4',
      'hover:bg-blue-700',
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
      'border-2 border-blue-600 font-bold text-blue-600 rounded-sm p-1 px-4',
      'hover:bg-blue-200 hover:text-blue-700',
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
      'border-2 border-transparent font-bold text-gray-600 rounded-sm p-1 px-4',
      'hover:bg-gray-200 hover:text-gray-700',
      className
    )}
    {...props}
  >
    {children}
  </button>
)
