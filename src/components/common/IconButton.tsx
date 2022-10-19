import {
  ButtonHTMLAttributes,
  Children,
  cloneElement,
  FC,
  ReactElement,
  useMemo,
} from 'react'
import { IconBaseProps } from 'react-icons'

import { twsx } from '../../utils/dom'
import Loader from './Loader'

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  children: ReactElement<IconBaseProps>
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const IconButton: FC<IconButtonProps> = ({
  children,
  size = 'md',
  loading,
  className,
  disabled,
  ...props
}) => {
  const iconSize = useMemo(() => {
    switch (size) {
      case 'sm':
        return 16
      case 'md':
        return 18
      case 'lg':
        return 24
    }
  }, [size])

  const icon = useMemo(
    () =>
      Children.map(children, (child) =>
        cloneElement(child, { size: iconSize })
      ),
    [children, iconSize]
  )

  return (
    <button
      className={twsx(
        'p-1 rounded bg-transparent hover:bg-gray-200 active:bg-gray-300 text-primary-500 border border-transparent focus:border-secondary-500 outline-none transition',
        disabled && 'pointer-events-none text-gray-400',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {loading ? <Loader size={iconSize} /> : icon}
    </button>
  )
}

export default IconButton
