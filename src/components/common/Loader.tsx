import { FC } from 'react'

import { twsx } from '../../utils/dom'

const DEFAULT_SIZE = 24

type LoaderProps = { className?: string; size?: number }

const Loader: FC<LoaderProps> = ({ className, size }) => (
  <svg
    className={twsx('animate-spin text-primary-500', className)}
    style={{ width: size ?? DEFAULT_SIZE, height: size ?? DEFAULT_SIZE }}
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
  >
    <circle
      className='opacity-25'
      cx='12'
      cy='12'
      r='10'
      stroke='currentColor'
      strokeWidth='4'
    ></circle>
    <path
      className='opacity-75'
      fill='currentColor'
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    ></path>
  </svg>
)

export const CenteredLoader: FC<LoaderProps> = (props) => (
  <div className='flex h-full w-full items-center justify-center'>
    <Loader {...props} />
  </div>
)

export default Loader
