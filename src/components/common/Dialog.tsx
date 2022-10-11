import { FC, PropsWithChildren, useRef } from 'react'
import ReactDOM from 'react-dom'

const Dialog: FC<PropsWithChildren<{ onClickOutside?: () => void }>> = ({
  children,
  onClickOutside,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  return ReactDOM.createPortal(
    <div
      onClick={(e) => {
        if (
          !ref.current ||
          !(e.target instanceof HTMLElement) ||
          !ref.current.contains(e.target)
        ) {
          return onClickOutside?.()
        }
      }}
      className='absolute top-0 left-0 flex h-screen w-screen items-center justify-center bg-black/50'
    >
      <div ref={ref}>{children}</div>
    </div>,
    document.body
  )
}

export default Dialog
