import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePopper } from 'react-popper'

const Popover: FC<
  PropsWithChildren<{ referenceElement?: HTMLElement | null }>
> = ({ referenceElement, children }) => {
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  )
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: 'arrow', options: { element: arrowElement, padding: 10 } },
      { name: 'offset', options: { offset: [0, 6] } },
    ],
  })

  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!referenceElement) return

    const onEnterListener = () => setShow(true)
    const onExitListener = () => setShow(false)

    referenceElement.addEventListener('mouseenter', onEnterListener)
    referenceElement.addEventListener('mouseleave', onExitListener)

    return () => {
      referenceElement.removeEventListener('mouseenter', onEnterListener)
      referenceElement.removeEventListener('mouseleave', onExitListener)
    }
  }, [referenceElement])

  if (!show) return null

  return createPortal(
    <div
      className='tooltip bg-black text-white shadow-lg px-2 py-1 text-sm'
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
    >
      {children}
      <div
        className='arrow w-2 h-2 before:absolute before:w-2 before:h-2 before:bg-black before:rotate-45'
        ref={setArrowElement}
        style={styles.arrow}
      />
    </div>,
    document.body
  )
}

export default Popover
