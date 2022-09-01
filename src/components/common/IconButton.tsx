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

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  children: ReactElement<IconBaseProps>
  size?: 'sm' | 'md' | 'lg'
}

const IconButton: FC<IconButtonProps> = ({
  children,
  size = 'md',
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
        'p-1 rounded bg-transparent hover:bg-neutral-200 active:bg-neutral-300 text-primary-500 border border-transparent focus:border-secondary-500 outline-none',
        disabled && 'pointer-events-none text-neutral-400',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  )
}

export default IconButton
