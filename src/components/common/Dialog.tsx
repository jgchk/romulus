import { FC, PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'

const Dialog: FC<PropsWithChildren> = ({ children }) =>
  ReactDOM.createPortal(
    <div className='absolute top-0 left-0 flex h-screen w-screen items-center justify-center bg-black/50'>
      <div>{children}</div>
    </div>,
    document.body
  )

export default Dialog
