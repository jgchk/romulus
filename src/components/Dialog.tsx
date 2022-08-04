import { FC, PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'

const Dialog: FC<PropsWithChildren<{ onClickOutside?: () => void }>> = ({
  children,
  onClickOutside,
}) =>
  ReactDOM.createPortal(
    <div
      className='w-screen h-screen absolute top-0 left-0 flex items-center justify-center bg-black/50'
      onClick={() => onClickOutside?.()}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  )

export default Dialog
